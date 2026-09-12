Deno.serve(() =>
  new Response(
    JSON.stringify({
      ok: false,
      code: "FORENSIC_HELPER_DISABLED",
      message: "V5 Azure OCR forensic capture helper is disabled.",
    }),
    {
      status: 410,
      headers: { "Content-Type": "application/json" },
    },
  )
);
