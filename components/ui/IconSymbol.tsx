import AntDesign from '@expo/vector-icons/AntDesign';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight } from 'expo-symbols';
import React, { ComponentProps } from 'react';
import { OpaqueColorValue, StyleProp, TextStyle } from 'react-native';

type MaterialIconName = ComponentProps<typeof MaterialIcons>['name'];
type AntDesignIconName = ComponentProps<typeof AntDesign>['name'];
type FontAwesomeIconName = ComponentProps<typeof FontAwesome>['name'];

type IconSource = 'MaterialIcons' | 'AntDesign' | 'FontAwesome';

type IconMapping = Record<
  string,
  { name: string; source: IconSource }
>;

type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to icon mappings here.
 */
const MAPPING: IconMapping = {
  'house.fill': { name: 'home', source: 'MaterialIcons' },
  'paperplane.fill': { name: 'send', source: 'MaterialIcons' },
  'calendar': { name: 'calendar', source: 'AntDesign' },
  // 'user-check': { name: 'user', source: 'FontAwesome' },
  'chevron.left.forwardslash.chevron.right': { name: 'code', source: 'MaterialIcons' },
  'chevron.right': { name: 'chevron-right', source: 'MaterialIcons' },
  'bubble.left.and.bubble.right.fill': { name: 'chat', source: 'MaterialIcons' },
  'schedule': { name: 'calendar-today', source: 'MaterialIcons' },
  'person.3.fill': { name: 'forum', source: 'MaterialIcons' },
  'square.grid.2x2.fill': { name: 'more-horiz', source: 'MaterialIcons' },
};

/**
 * Reusable icon component fallback using multiple icon packs.
 */
export function IconSymbol({
  name,
  size = 34,
  color,
  style,
  weight,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  const mapping = MAPPING[name];

  if (!mapping) {
    return null;
  }

  switch (mapping.source) {
    case 'AntDesign':
      return <AntDesign name={mapping.name as AntDesignIconName} size={size} color={color} style={style} />;
    case 'FontAwesome':
      return <FontAwesome name={mapping.name as FontAwesomeIconName} size={size} color={color} style={style} />;
    case 'MaterialIcons':
    default:
      return <MaterialIcons name={mapping.name as MaterialIconName} size={size} color={color} style={style} />;
  }
}
