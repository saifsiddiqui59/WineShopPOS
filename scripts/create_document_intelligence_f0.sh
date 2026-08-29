#!/usr/bin/env bash
set -euo pipefail

# WineShopPOS Azure Document Intelligence F0 provisioner.
# Safe rule: only F0. Never silently create S0.

SUBSCRIPTION="Azure subscription 1"
TARGET_RG="wineshopPOS"
TARGET_LOCATION="centralindia"
KIND="FormRecognizer"
PROJECT_REF="uiurgplnsgmawvxhjzzp"

if ! command -v az >/dev/null 2>&1; then
  echo "ERROR: Azure CLI (az) is not installed."
  exit 1
fi

if ! az account show >/dev/null 2>&1; then
  echo "Azure login required..."
  az login
fi

az account set --subscription "$SUBSCRIPTION"

if ! az group show --name "$TARGET_RG" >/dev/null 2>&1; then
  echo "ERROR: Azure resource group $TARGET_RG was not found."
  exit 1
fi

echo "Registering Microsoft.CognitiveServices if needed..."
az provider register --namespace Microsoft.CognitiveServices --wait >/dev/null

F0_AVAILABLE="$(az cognitiveservices account list-skus \
  --kind "$KIND" \
  --location "$TARGET_LOCATION" \
  --query "[?name=='F0'].name | [0]" \
  -o tsv 2>/dev/null || true)"

if [[ "$F0_AVAILABLE" != "F0" ]]; then
  echo "WARNING: Azure did not advertise Document Intelligence F0 in $TARGET_LOCATION."
fi

# Prefer an existing project-local F0 resource.
DOC_NAME="$(az cognitiveservices account list \
  --resource-group "$TARGET_RG" \
  --query "[?kind=='FormRecognizer' && sku.name=='F0'] | [0].name" \
  -o tsv 2>/dev/null || true)"
DOC_RG="$TARGET_RG"
DOC_LOCATION=""
DOC_REUSED="false"

if [[ -n "$DOC_NAME" ]]; then
  DOC_REUSED="true"
  DOC_LOCATION="$(az cognitiveservices account show -n "$DOC_NAME" -g "$DOC_RG" --query location -o tsv)"
  echo "Reusing existing F0 Document Intelligence resource: $DOC_NAME"
else
  if [[ "$F0_AVAILABLE" == "F0" ]]; then
    SUB_ID="$(az account show --query id -o tsv)"
    if command -v sha256sum >/dev/null 2>&1; then
      SUFFIX="$(printf '%s' "$SUB_ID" | sha256sum | cut -c1-8)"
    else
      SUFFIX="$(printf '%s' "$SUB_ID" | tr -cd '[:alnum:]' | tail -c 9)"
    fi
    DOC_NAME="wineshoppos-docintel-${SUFFIX,,}"
    echo "Creating Azure Document Intelligence F0: $DOC_NAME"
    set +e
    CREATE_OUTPUT="$(az cognitiveservices account create \
      --name "$DOC_NAME" \
      --resource-group "$TARGET_RG" \
      --kind "$KIND" \
      --sku F0 \
      --location "$TARGET_LOCATION" \
      --tags project=WineShopPOS costTier=F0-free-only \
      --yes \
      --only-show-errors \
      -o json 2>&1)"
    CREATE_RC=$?
    set -e

    if [[ $CREATE_RC -ne 0 ]]; then
      echo "First F0 create attempt failed. No paid resource was created."
      echo "$CREATE_OUTPUT"

      # Retry once with a different free-resource name in case only the name collided.
      RETRY_NAME="wineshoppos-docintel-${SUFFIX,,}-$RANDOM"
      echo "Retrying F0 with alternate name: $RETRY_NAME"
      set +e
      CREATE_OUTPUT="$(az cognitiveservices account create \
        --name "$RETRY_NAME" \
        --resource-group "$TARGET_RG" \
        --kind "$KIND" \
        --sku F0 \
        --location "$TARGET_LOCATION" \
        --tags project=WineShopPOS costTier=F0-free-only \
        --yes \
        --only-show-errors \
        -o json 2>&1)"
      CREATE_RC=$?
      set -e
      if [[ $CREATE_RC -eq 0 ]]; then
        DOC_NAME="$RETRY_NAME"
        DOC_LOCATION="$TARGET_LOCATION"
      else
        echo "Second F0 create attempt also failed. No paid resource was created."
        echo "$CREATE_OUTPUT"
        DOC_NAME=""
      fi
    else
      DOC_LOCATION="$TARGET_LOCATION"
    fi
  fi

  # If F0 creation is blocked because the subscription already has a free
  # FormRecognizer account elsewhere, reuse that free account rather than pay.
  if [[ -z "$DOC_NAME" ]]; then
    EXISTING_ROW="$(az cognitiveservices account list \
      --query "[?kind=='FormRecognizer' && sku.name=='F0'] | [0].[name,resourceGroup,location]" \
      -o tsv 2>/dev/null || true)"
    if [[ -n "$EXISTING_ROW" ]]; then
      IFS=$'\t' read -r DOC_NAME DOC_RG DOC_LOCATION <<< "$EXISTING_ROW"
      DOC_REUSED="true"
      echo "Reusing subscription F0 Document Intelligence resource: $DOC_NAME ($DOC_RG / $DOC_LOCATION)"
    fi
  fi
fi

if [[ -z "$DOC_NAME" ]]; then
  echo "OCR_F0_AVAILABLE=false"
  echo "No F0 resource could be created or reused."
  echo "The installer will NOT create S0 or any paid OCR resource."
  exit 20
fi

ACTUAL_SKU="$(az cognitiveservices account show -n "$DOC_NAME" -g "$DOC_RG" --query sku.name -o tsv)"
if [[ "$ACTUAL_SKU" != "F0" ]]; then
  echo "ERROR: Selected OCR resource is $ACTUAL_SKU, not F0. Refusing to continue."
  exit 21
fi

DOC_ENDPOINT="$(az cognitiveservices account show -n "$DOC_NAME" -g "$DOC_RG" --query properties.endpoint -o tsv)"
DOC_KEY="$(az cognitiveservices account keys list -n "$DOC_NAME" -g "$DOC_RG" --query key1 -o tsv)"

if [[ -z "$DOC_ENDPOINT" || -z "$DOC_KEY" ]]; then
  echo "ERROR: Could not retrieve F0 endpoint/key."
  exit 22
fi

# Outputs intended for the parent installer. Key is written only to the named
# temp env file when supplied; it is never printed.
if [[ -n "${WINESHOP_OCR_SECRET_FILE:-}" ]]; then
  umask 077
  cat > "$WINESHOP_OCR_SECRET_FILE" <<EOF
AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT=$DOC_ENDPOINT
AZURE_DOCUMENT_INTELLIGENCE_KEY=$DOC_KEY
EOF
  chmod 600 "$WINESHOP_OCR_SECRET_FILE" 2>/dev/null || true
fi

if [[ -n "${WINESHOP_OCR_METADATA_FILE:-}" ]]; then
  mkdir -p "$(dirname "$WINESHOP_OCR_METADATA_FILE")"
  cat > "$WINESHOP_OCR_METADATA_FILE" <<EOF
# Azure Document Intelligence — WineShopPOS

- Resource name: \`$DOC_NAME\`
- Resource group: \`$DOC_RG\`
- Location: \`$DOC_LOCATION\`
- Kind: \`FormRecognizer\`
- SKU: \`F0\`
- Endpoint: \`$DOC_ENDPOINT\`
- Reused existing resource: \`$DOC_REUSED\`
- Model used by application: \`prebuilt-invoice\`
- REST API version: \`2024-11-30\`

The subscription key is intentionally **not documented or committed**. It is stored only as a Supabase Edge Function secret.

Cost rule: the deployment automation accepts F0 only and has no automatic S0 fallback.
EOF
fi

unset DOC_KEY

echo "OCR_F0_AVAILABLE=true"
echo "OCR_RESOURCE_NAME=$DOC_NAME"
echo "OCR_RESOURCE_GROUP=$DOC_RG"
echo "OCR_RESOURCE_LOCATION=$DOC_LOCATION"
echo "OCR_ENDPOINT=$DOC_ENDPOINT"
