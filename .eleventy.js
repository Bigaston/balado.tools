const yaml = require("js-yaml");

module.exports = function (eleventyConfig) {
  eleventyConfig.addDataExtension("yaml, yml", contents => yaml.load(contents));

  eleventyConfig.addPassthroughCopy({ "./src/public": "/" });

  eleventyConfig.addGlobalData("generated", () => {
    let now = new Date();
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "full",
      timeStyle: "long",
    }).format(now);
  });

  return {
    dir: {
      input: "src",
      output: "_site",
    },
  }
};