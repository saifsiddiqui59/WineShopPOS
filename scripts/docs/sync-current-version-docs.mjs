import fs from "node:fs";
import path from "node:path";

const version=fs.readFileSync("docs/CURRENT_VERSION","utf8").trim();
if(!/^v\d+$/i.test(version)) throw new Error(`Invalid CURRENT_VERSION: ${version}`);
const pairs=[
[`docs/versions/${version}/architecture/PROJECT_CONTEXT.md`,"docs/PROJECT_CONTEXT.md"],
[`docs/versions/${version}/operations/DEVELOPER_HANDBOOK.md`,"docs/handbook/WineShopPOS_Developer_Handbook_Master_Reconsolidation.md"],
[`docs/versions/${version}/user/USER_MANUAL.md`,"docs/manual/WineShopPOS_User_Manual_Master_Reconsolidation.md"],
[`docs/versions/${version}/operations/AI_PRODUCTION_BASELINE.md`,"docs/AI_PRODUCTION_BASELINE.md"],
["docs/shared/release/RELEASE_EXECUTOR_FAILURE_REGISTER.md","docs/RELEASE_EXECUTOR_FAILURE_REGISTER.md"],
];
for(const [src,dst] of pairs){
  if(!fs.existsSync(src)) throw new Error(`Missing canonical versioned doc: ${src}`);
  fs.mkdirSync(path.dirname(dst),{recursive:true});
  fs.copyFileSync(src,dst);
}
console.log(`Synced compatibility docs from ${version}.`);
