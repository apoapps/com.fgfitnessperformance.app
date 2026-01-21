const React = require('react');
const { View, Text } = require('react-native');

const createMockIcon = (iconSetName) => {
  const MockIcon = (props) => {
    const { testID, name, size, color, ...rest } = props;
    return React.createElement(
      View,
      { testID: testID || `icon-${name || iconSetName}`, ...rest },
      React.createElement(Text, null, name || iconSetName)
    );
  };
  MockIcon.displayName = iconSetName;
  return MockIcon;
};

module.exports = {
  Ionicons: createMockIcon('Ionicons'),
  MaterialIcons: createMockIcon('MaterialIcons'),
  FontAwesome: createMockIcon('FontAwesome'),
  Feather: createMockIcon('Feather'),
  MaterialCommunityIcons: createMockIcon('MaterialCommunityIcons'),
  createIconSet: () => createMockIcon('CustomIcon'),
};
