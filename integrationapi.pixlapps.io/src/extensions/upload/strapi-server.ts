module.exports = (plugin) => {
  var imageManipulation = plugin.services["image-manipulation"];
  plugin.services["image-manipulation"] = () => {
    return {
      ...imageManipulation(),
      generateThumbnail: () => {},
    };
  };
  return plugin;
};
