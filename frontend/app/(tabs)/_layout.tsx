// import React, { useEffect, useState } from 'react';
// import ElderlyTabs from './ElderlyTabs';
// import FamilyTabs from './Familytabs'; // Ensure this matches your filename
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { ActivityIndicator, View, Text } from 'react-native';

// export default function Tabs() {
//   const [role, setRole] = useState<string | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchRole = async () => {
//       try {
//         console.log('[Tabs] Attempting to fetch user role from AsyncStorage...');
//         const storedRole = await AsyncStorage.getItem('userRole');
//         console.log('[Tabs] Retrieved role:', storedRole);
//         if (storedRole === 'elderly' || storedRole === 'family_member') {
//           setRole(storedRole);
//         } else if (storedRole) {
//           console.warn(`[Tabs] Unexpected role value found: "${storedRole}"`);
//           setRole(null);
//         } else {
//           console.warn('[Tabs] No role found in AsyncStorage.');
//           setRole(null);
//         }
//       } catch (err) {
//         console.error('[Tabs] Error fetching role from AsyncStorage:', err);
//         setRole(null);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchRole();
//   }, []);

//   if (loading) {
//     console.log('[Tabs] Loading user role...');
//     return (
//       <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//         <ActivityIndicator size="large" color="#007AFF" />
//         <Text>Loading role...</Text>
//       </View>
//     );
//   }

//   if (role === 'elderly') {
//     console.log('[Tabs] Rendering ElderlyTabs');
//     return <ElderlyTabs />;
//   }
//   if (role === 'family_member') {
//     console.log('[Tabs] Rendering FamilyTabs');
//     return <FamilyTabs />;
//   }

//   // Defensive fallback UI
//   console.warn('[Tabs] No valid role detected. Rendering fallback UI.');
//   return (
//     <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//       <Text style={{ color: 'red', fontWeight: 'bold', fontSize: 18 }}>
//         No valid user role found.
//       </Text>
//       <Text style={{ marginTop: 10, color: '#555' }}>
//         Please log in again or contact support.
//       </Text>
//     </View>
//   );
// }



import { useEffect, useState } from "react";
import ElderlyTabs from "./ElderlyTabs";
import FamilyTabs from "./Familytabs";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  ActivityIndicator,
  View,
  Text,
  SafeAreaView,
  StyleSheet,
} from "react-native";

export default function Tabs() {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      try {
        console.log(
          "[Tabs] Attempting to fetch user role from AsyncStorage..."
        );
        const storedRole = await AsyncStorage.getItem("userRole");
        console.log("[Tabs] Retrieved role:", storedRole);
        if (storedRole === "elderly" || storedRole === "family_member") {
          setRole(storedRole);
        } else if (storedRole) {
          console.warn(`[Tabs] Unexpected role value found: "${storedRole}"`);
          setRole(null);
        } else {
          console.warn("[Tabs] No role found in AsyncStorage.");
          setRole(null);
        }
      } catch (err) {
        console.error("[Tabs] Error fetching role from AsyncStorage:", err);
        setRole(null);
      } finally {
        setLoading(false);
      }
    };
    fetchRole();
  }, []);

  if (loading) {
    console.log("[Tabs] Loading user role...");
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text>Loading role...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (role === "elderly") {
    console.log("[Tabs] Rendering ElderlyTabs");
    return (
      <SafeAreaView style={styles.container}>
        <ElderlyTabs />
      </SafeAreaView>
    );
  }

  if (role === "family_member") {
    console.log("[Tabs] Rendering FamilyTabs");
    return (
      <SafeAreaView style={styles.container}>
        <FamilyTabs />
      </SafeAreaView>
    );
  }

  // Defensive fallback UI
  console.warn("[Tabs] No valid role detected. Rendering fallback UI.");
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.centered}>
        <Text style={styles.errorTitle}>No valid user role found.</Text>
        <Text style={styles.errorSubtitle}>
          Please log in again or contact support.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorTitle: {
    color: "red",
    fontWeight: "bold",
    fontSize: 18,
  },
  errorSubtitle: {
    marginTop: 10,
    color: "#555",
  },
});

