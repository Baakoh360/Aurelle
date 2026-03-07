import { Tabs } from "expo-router";
import React, { useRef, useCallback, useEffect } from "react";
import { Animated, Pressable, Platform } from "react-native";
import { BookOpen, Calendar, Home, MessageCircle, Settings } from "lucide-react-native";
import Colors from "@/constants/colors";

function AnimatedTabIcon({
  focused,
  children,
}: {
  focused: boolean;
  children: React.ReactNode;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const bounce = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (focused) {
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1.15,
          useNativeDriver: true,
          speed: 80,
          bounciness: 10,
        }),
        Animated.sequence([
          Animated.timing(bounce, {
            toValue: 1,
            duration: 120,
            useNativeDriver: true,
          }),
          Animated.spring(bounce, {
            toValue: 0,
            useNativeDriver: true,
            speed: 120,
            bounciness: 6,
          }),
        ]),
      ]).start();
    } else {
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 60,
        bounciness: 8,
      }).start();
    }
  }, [focused, scale, bounce]);

  const translateY = bounce.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -4],
  });

  return (
    <Animated.View
      style={{
        transform: [{ scale }, { translateY }],
      }}
    >
      {children}
    </Animated.View>
  );
}

function AnimatedTabButton(props: {
  children: React.ReactNode;
  onPress?: (e?: unknown) => void;
  onLongPress?: (e?: unknown) => void;
  style?: unknown;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scale, {
      toValue: 0.88,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  }, [scale]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 8,
    }).start();
  }, [scale]);

  return (
    <Pressable
      onPress={props.onPress}
      onLongPress={props.onLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={props.style as object}
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        {props.children}
      </Animated.View>
    </Pressable>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.lightText,
        tabBarStyle: {
          backgroundColor: Colors.background,
          borderTopWidth: 0,
          height: 90,
          paddingTop: 10,
          paddingBottom: Platform.OS === "ios" ? 20 : 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
          elevation: 12,
        },
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "700",
          letterSpacing: 0.3,
        },
        tabBarItemStyle: {
          paddingTop: 4,
          minHeight: 44,
        },
        tabBarButton: (props) => (
          <AnimatedTabButton
            onPress={props.onPress as (e?: unknown) => void}
            onLongPress={props.onLongPress as (e?: unknown) => void}
            style={props.style}
          >
            {props.children}
          </AnimatedTabButton>
        ),
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon focused={focused}>
              <Home color={color} size={24} strokeWidth={focused ? 2.5 : 2} />
            </AnimatedTabIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: "Calendar",
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon focused={focused}>
              <Calendar color={color} size={24} strokeWidth={focused ? 2.5 : 2} />
            </AnimatedTabIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          title: "H Guide",
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon focused={focused}>
              <BookOpen color={color} size={24} strokeWidth={focused ? 2.5 : 2} />
            </AnimatedTabIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "AuraBot",
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon focused={focused}>
              <MessageCircle color={color} size={24} strokeWidth={focused ? 2.5 : 2} />
            </AnimatedTabIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon focused={focused}>
              <Settings color={color} size={24} strokeWidth={focused ? 2.5 : 2} />
            </AnimatedTabIcon>
          ),
        }}
      />
    </Tabs>
  );
}
