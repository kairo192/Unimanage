import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { colors, typography } from '../theme';
import LoginScreen from '../screens/LoginScreen';
import MyTicketsScreen from '../screens/MyTicketsScreen';
import TicketDetailScreen from '../screens/TicketDetailScreen';
import ReportIssueScreen from '../screens/ReportIssueScreen';
import ProfileScreen from '../screens/ProfileScreen';

const RootStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const TicketsStack = createNativeStackNavigator();

const tabs = [
  { name: 'TicketsHome', label: 'Tickets', icon: '🎫' },
  { name: 'Report', label: 'Report', icon: '➕' },
  { name: 'Profile', label: 'Profile', icon: '👤' },
];

function TabIcon({ routeName, focused }) {
  const tab = tabs.find((t) => t.name === routeName);
  return (
    <View style={tabIconWrap}>
      <Text style={[tabIconBase, focused && tabIconActive]}>{tab?.icon || '•'}</Text>
    </View>
  );
}

const tabIconWrap = { alignItems: 'center', justifyContent: 'center' };
const tabIconBase = { fontSize: 22, opacity: 0.45 };
const tabIconActive = { opacity: 1 };

function TicketsStackNav() {
  return (
    <TicketsStack.Navigator screenOptions={{ headerShown: false }}>
      <TicketsStack.Screen name="MyTickets" component={MyTicketsScreen} />
      <TicketsStack.Screen
        name="TicketDetail"
        component={TicketDetailScreen}
        options={{ animation: 'slide_from_right' }}
      />
    </TicketsStack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => <TabIcon routeName={route.name} focused={focused} />,
        tabBarActiveTintColor: colors.dark,
        tabBarInactiveTintColor: colors.quaternaryLabel,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.separator,
          paddingBottom: 8,
          paddingTop: 8,
          height: 56,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          letterSpacing: 0.07,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="TicketsHome" component={TicketsStackNav} options={{ tabBarLabel: 'Tickets' }} />
      <Tab.Screen name="Report" component={ReportIssueScreen} options={{ tabBarLabel: 'Report' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        <RootStack.Screen name="Login" component={LoginScreen} />
        <RootStack.Screen name="Main" component={MainTabs} />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
