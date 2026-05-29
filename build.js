const esbuild = require("esbuild");
const fs = require("fs");

if (!fs.existsSync("dist")) fs.mkdirSync("dist");

async function build() {
  let css = "";

  await esbuild.build({
    entryPoints: ["src/index.js"],
    bundle: true,
    minify: true,
    format: "esm",
    outfile: "dist/vidstack-bundle.js",
    plugins: [
      {
        name: "css-output",
        setup(build) {
          build.onLoad({ filter: /\.css$/ }, async (args) => {
            const content = await fs.promises.readFile(args.path, "utf8");
            css += content;
            return { contents: "" };
          });
          build.onEnd(() => {
            fs.writeFileSync("dist/vidstack-bundle.css", css);
          });
        },
      },
    ],
    splitting: false,
    treeShaking: true,
  });

  console.log("✅ Build completo! Pasta /dist pronta.");
}

build();
