/*
This script can be used to automatically create our github workflows.

It copies the all scripts from `build/workflows` to `.github/workflows`
while replacing '# kmap.import-action.<name> #' with the corresponding action
<name> from `build/workflows/actions/<name>.yml`
 */

const path = require("path");
const fs = require("fs");

/**
 * Contains all important directories
 */
const Dirs = {
  origin: {
    workflows: path.join(__dirname, "workflows"),
    actions: path.join(__dirname, "workflows", "actions"),
  },
  target: {
    workflows: path.join(__dirname, "..", ".github", "workflows"),
  },
};

/** Contains all available workflows */
const workflows = fs
  .readdirSync(Dirs.origin.workflows)
  .filter((w) => w.endsWith(".yml"));
/** Contains all available custom actions */
const actions = fs.readdirSync(Dirs.origin.actions).map((x) => x.slice(0, -4));

console.log("Workflows: ", workflows);
console.log("Actions: ", actions);
console.log();

for (const workflow of workflows) {
  console.log("- " + workflow);
  const logPadded = (data) => console.log("  - " + data);
  const pathToWorkflow = path.join(Dirs.origin.workflows, workflow);
  const newFileContent = [
    "# This file was autogenerated by the KMAP workflow build script",
  ];

  for (const line of fs.readFileSync(pathToWorkflow, "UTF-8").split(/\r?\n/)) {
    newFileContent.push(line);

    // Look for an action
    const match = line.match(
      /(?<indent> *)# kmap\.import-action\.(?<action>.*) #/
    );
    if (match) {
      const indent = match.groups.indent || "";
      const action = match.groups.action;

      if (action != null) {
        // Action found
        logPadded("imported '" + action + "'");

        newFileContent.push(
          ...fs
            .readFileSync(
              path.join(Dirs.origin.actions, action + ".yml"),
              "UTF-8"
            )
            .split(/\r?\n/)
            .map((actionLine) => indent + actionLine)
        );
      }
    }
  }

  // Write File
  fs.writeFileSync(
    path.join(Dirs.target.workflows, workflow),
    newFileContent.join("\n")
  );
}
