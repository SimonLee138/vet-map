import type { Href } from 'expo-router';
import {
  TabList,
  TabListProps,
  Tabs,
  TabSlot,
  TabTrigger,
  TabTriggerSlotProps,
} from 'expo-router/ui';
import { PawPrint, Search, UserRound } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from './themed-text';

export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot style={{ height: '100%' }} />
      <TabList asChild>
        <CustomTabList>
          <TabTrigger name="index" href={'/' as Href} asChild>
            <TabButton>Search</TabButton>
          </TabTrigger>
          <TabTrigger name="pet-pass" href="/pet-pass" asChild>
            <TabButton>Pet Pass</TabButton>
          </TabTrigger>
          <TabTrigger name="profile" href="/profile" asChild>
            <TabButton>Profile</TabButton>
          </TabTrigger>
        </CustomTabList>
      </TabList>
    </Tabs>
  );
}

export function TabButton({ children, isFocused, ...props }: TabTriggerSlotProps) {
  const Icon =
    children === 'Search'
      ? Search
      : children === 'Pet Pass'
        ? PawPrint
        : UserRound;

  return (
    <Pressable {...props} style={({ pressed }) => [styles.tabButton, pressed && styles.pressed]}>
      <View style={styles.tabButtonView}>
        <Icon
          size={20}
          strokeWidth={isFocused ? 2.5 : 2}
          color={isFocused ? '#3676e8' : '#a8b7c9'}
        />
        <ThemedText
          type="small"
          themeColor={isFocused ? 'text' : 'textSecondary'}
          style={isFocused ? styles.activeLabel : styles.inactiveLabel}>
          {children}
        </ThemedText>
      </View>
    </Pressable>
  );
}

export function CustomTabList(props: TabListProps) {
  return (
    <View {...props} style={styles.tabListContainer}>
      <View style={styles.innerContainer}>
        {props.children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabListContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    paddingBottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e7edf4',
  },
  innerContainer: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 560,
    borderRadius: 0,
    backgroundColor: '#ffffff',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
  tabButtonView: {
    width: '100%',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 0,
    alignItems: 'center',
    gap: 3,
  },
  activeLabel: {
    color: '#3676e8',
    fontWeight: '700',
  },
  inactiveLabel: {
    color: '#8493a6',
  },
});
