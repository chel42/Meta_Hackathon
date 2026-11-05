import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  useWindowDimensions,
  ScrollView,
} from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { TraunesAILogo } from '../ui/TraunesAILogo';
import { THEME } from '../../theme/colors';
import {
  IconHome,
  IconPlusCircle,
  IconFileText,
  IconHistory,
  IconUser,
  IconSettings,
  IconLogOut,
  IconBell,
  IconMenu,
  IconX,
  IconCheckCircle,
  IconGraduationCap,
  IconGamepad,
  IconAward,
  IconMap,
  IconUsers,
  IconMessageSquare,
  IconShield,
} from '../../icons/Icons';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAllAsRead } = useNotifications();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const isDesktop = width >= 900;

  const navItems = [
    { label: 'Accueil', path: '/dashboard', icon: IconHome, section: 'Vérification' },
    { label: 'Nouvelle vérification', path: '/new-check', icon: IconPlusCircle, section: 'Vérification' },
    { label: 'Historique', path: '/historique', icon: IconFileText, matchPrefix: '/reports', section: 'Vérification' },
    { label: 'Académie EMI', path: '/academie-emi', icon: IconGraduationCap, matchPrefix: '/academie-emi', section: 'Éducation' },
    { label: 'Profil', path: '/profil', icon: IconUser, section: 'Compte' },
  ];

  const handleNavigate = (path: string) => {
    router.push(path as any);
    setMobileMenuOpen(false);
    setNotificationsOpen(false);
  };

  const handleLogout = () => {
    logout();
    router.replace('/login' as any);
  };

  const isItemActive = (item: (typeof navItems)[0]) => {
    if (item.matchPrefix && pathname.startsWith(item.matchPrefix)) {
      return true;
    }
    return pathname === item.path || (item.path === '/dashboard' && pathname === '/');
  };

  return (
    <View style={styles.container}>
      {/* Desktop Sidebar */}
      {isDesktop && (
        <View style={styles.sidebar}>
          {/* Top Brand Logo */}
          <Pressable onPress={() => handleNavigate('/dashboard')} style={styles.sidebarBrand}>
            <TraunesAILogo size="md" lightMode={true} />
          </Pressable>

          {/* Main Navigation Links */}
          <ScrollView style={styles.navScroll} showsVerticalScrollIndicator={false}>
            <View style={styles.navGroup}>
              {navItems.map((item) => {
                const active = isItemActive(item);
                const IconComponent = item.icon;
                return (
                  <Pressable
                    key={item.label}
                    onPress={() => handleNavigate(item.path)}
                    style={({ hovered }: any) => [
                      styles.navLink,
                      active && styles.navLinkActive,
                      hovered && !active && styles.navLinkHovered,
                    ]}
                  >
                    <IconComponent
                      size={20}
                      color={active ? '#FFFFFF' : '#94A3B8'}
                    />
                    <Text
                      style={[
                        styles.navLinkLabel,
                        active && styles.navLinkLabelActive,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>

          {/* Bottom Controls */}
          <View style={styles.sidebarFooter}>
            <Pressable
              onPress={() => handleNavigate('/parametres')}
              style={({ hovered }: any) => [
                styles.navLink,
                pathname === '/parametres' && styles.navLinkActive,
                hovered && pathname !== '/parametres' && styles.navLinkHovered,
              ]}
            >
              <IconSettings
                size={20}
                color={pathname === '/parametres' ? '#FFFFFF' : '#94A3B8'}
              />
              <Text
                style={[
                  styles.navLinkLabel,
                  pathname === '/parametres' && styles.navLinkLabelActive,
                ]}
              >
                Paramètres
              </Text>
            </Pressable>

            <Pressable
              onPress={handleLogout}
              style={({ hovered }: any) => [
                styles.navLink,
                styles.logoutLink,
                hovered && styles.navLinkHovered,
              ]}
            >
              <IconLogOut size={20} color="#F87171" />
              <Text style={[styles.navLinkLabel, { color: '#F87171' }]}>Se déconnecter</Text>
            </Pressable>

            {/* User Mini Profile */}
            {user && (
              <Pressable
                onPress={() => handleNavigate('/profil')}
                style={styles.userMiniRow}
              >
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarInitials}>
                    {user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.userInfoCol}>
                  <Text style={styles.userNameText} numberOfLines={1}>
                    {user.name}
                  </Text>
                  <Text style={styles.userOrgText} numberOfLines={1}>
                    {user.organization || 'Vérificateur'}
                  </Text>
                </View>
              </Pressable>
            )}
          </View>
        </View>
      )}

      {/* Main Content Area */}
      <View style={styles.mainContent}>
        {/* Top Header */}
        <View style={styles.topHeader}>
          {!isDesktop && (
            <Pressable
              onPress={() => setMobileMenuOpen(true)}
              style={styles.menuIconButton}
              accessibilityLabel="Ouvrir le menu"
            >
              <IconMenu size={24} color={THEME.colors.navy} />
            </Pressable>
          )}

          <View style={styles.headerTitleContainer}>
            {!isDesktop ? (
              <TraunesAILogo size="sm" showSubtitle={false} />
            ) : (
              <Text style={styles.pageHeaderTitle}>
                {pathname === '/dashboard' || pathname === '/'
                  ? 'Accueil'
                  : pathname === '/new-check'
                  ? 'Nouvelle vérification'
                  : pathname.startsWith('/reports')
                  ? 'Dossier de preuve TRAUNES AI'
                  : pathname.startsWith('/runs')
                  ? 'Enquête en direct'
                  : pathname === '/historique'
                  ? 'Historique des vérifications'
                  : pathname.startsWith('/academie-emi')
                  ? 'Académie EMI'
                  : pathname.startsWith('/quiz-jeux-defis')
                  ? 'Quiz - Jeux & Défis'
                  : pathname === '/badges'
                  ? 'Mes badges'
                  : pathname === '/map'
                  ? 'Carte des Fake News'
                  : pathname.startsWith('/community')
                  ? 'Communauté'
                  : pathname === '/messages'
                  ? 'Messages'
                  : pathname === '/profil'
                  ? 'Profil vérificateur'
                  : pathname === '/parametres'
                  ? 'Paramètres'
                  : 'TRAUNES AI'}
              </Text>
            )}
          </View>

          {/* Right Header Actions: Notification Bell + Quick Check */}
          <View style={styles.headerRightActions}>
            <Pressable
              onPress={() => setNotificationsOpen(!notificationsOpen)}
              style={styles.bellButton}
              accessibilityLabel="Notifications"
            >
              <IconBell size={20} color={THEME.colors.navy} />
              {unreadCount > 0 && (
                <View style={styles.badgeCount}>
                  <Text style={styles.badgeCountText}>{unreadCount}</Text>
                </View>
              )}
            </Pressable>

            {isDesktop && (
              <Pressable
                onPress={() => handleNavigate('/new-check')}
                style={({ hovered }: any) => [
                  styles.quickCheckButton,
                  hovered && styles.quickCheckButtonHovered,
                ]}
              >
                <IconPlusCircle size={16} color="#FFFFFF" />
                <Text style={styles.quickCheckText}>Vérifier</Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* Notifications Dropdown Panel */}
        {notificationsOpen && (
          <View style={styles.notificationsOverlay}>
            <View style={styles.notificationsDropdown}>
              <View style={styles.notifHeader}>
                <Text style={styles.notifTitle}>Notifications</Text>
                <Pressable onPress={markAllAsRead}>
                  <Text style={styles.markReadText}>Tout marquer comme lu</Text>
                </Pressable>
              </View>

              <ScrollView style={styles.notifList} showsVerticalScrollIndicator={false}>
                {notifications.length === 0 ? (
                  <Text style={styles.emptyNotifText}>Aucune notification</Text>
                ) : (
                  notifications.map((item) => (
                    <Pressable
                      key={item.id}
                      onPress={() => {
                        if (item.link) handleNavigate(item.link);
                      }}
                      style={[
                        styles.notifItem,
                        !item.read && styles.notifItemUnread,
                      ]}
                    >
                      <View style={styles.notifItemDotCol}>
                        {!item.read && <View style={styles.unreadDot} />}
                      </View>
                      <View style={styles.notifItemContent}>
                        <Text style={styles.notifItemTitle}>{item.title}</Text>
                        <Text style={styles.notifItemMessage}>{item.message}</Text>
                        <Text style={styles.notifItemTime}>{item.timestamp}</Text>
                      </View>
                    </Pressable>
                  ))
                )}
              </ScrollView>
            </View>
          </View>
        )}

        {/* Page Content ScrollView */}
        <ScrollView
          style={styles.pageScrollView}
          contentContainerStyle={[
            styles.pageScrollContent,
            !isDesktop && styles.pageScrollContentMobile,
          ]}
          showsVerticalScrollIndicator={true}
        >
          {children}
        </ScrollView>

        {/* Mobile Bottom Navigation Bar */}
        {!isDesktop && (
          <View style={styles.bottomTabBar}>
            {navItems.slice(0, 4).map((item) => {
              const active = isItemActive(item);
              const IconComponent = item.icon;
              return (
                <Pressable
                  key={item.label}
                  onPress={() => handleNavigate(item.path)}
                  style={styles.bottomTabButton}
                >
                  <IconComponent
                    size={20}
                    color={active ? THEME.colors.primary : '#64748B'}
                  />
                  <Text
                    style={[
                      styles.bottomTabLabel,
                      active && styles.bottomTabLabelActive,
                    ]}
                    numberOfLines={1}
                  >
                    {item.label === 'Nouvelle vérification' ? 'Vérifier' : item.label}
                  </Text>
                </Pressable>
              );
            })}
            <Pressable
              onPress={() => handleNavigate('/profil')}
              style={styles.bottomTabButton}
            >
              <IconUser
                size={20}
                color={pathname === '/profil' ? THEME.colors.primary : '#64748B'}
              />
              <Text
                style={[
                  styles.bottomTabLabel,
                  pathname === '/profil' && styles.bottomTabLabelActive,
                ]}
              >
                Profil
              </Text>
            </Pressable>
          </View>
        )}
      </View>

      {/* Mobile Drawer Slide-Over */}
      {!isDesktop && mobileMenuOpen && (
        <View style={styles.mobileDrawerOverlay}>
          <Pressable
            style={styles.mobileDrawerBackdrop}
            onPress={() => setMobileMenuOpen(false)}
          />
          <View style={styles.mobileDrawerContent}>
            <View style={styles.drawerHeader}>
              <TraunesAILogo size="sm" lightMode={true} />
              <Pressable onPress={() => setMobileMenuOpen(false)}>
                <IconX size={24} color="#FFFFFF" />
              </Pressable>
            </View>

            <ScrollView style={styles.drawerNavList}>
              {navItems.map((item) => {
                const active = isItemActive(item);
                const IconComponent = item.icon;
                return (
                  <Pressable
                    key={item.label}
                    onPress={() => handleNavigate(item.path)}
                    style={[
                      styles.drawerNavLink,
                      active && styles.drawerNavLinkActive,
                    ]}
                  >
                    <IconComponent
                      size={20}
                      color={active ? '#FFFFFF' : '#94A3B8'}
                    />
                    <Text
                      style={[
                        styles.drawerNavLinkText,
                        active && styles.drawerNavLinkTextActive,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </Pressable>
                );
              })}

              <View style={styles.drawerDivider} />

              <Pressable
                onPress={() => handleNavigate('/parametres')}
                style={[
                  styles.drawerNavLink,
                  pathname === '/parametres' && styles.drawerNavLinkActive,
                ]}
              >
                <IconSettings size={20} color={pathname === '/parametres' ? '#FFFFFF' : '#94A3B8'} />
                <Text style={styles.drawerNavLinkText}>Paramètres</Text>
              </Pressable>

              <Pressable
                onPress={handleLogout}
                style={[styles.drawerNavLink, styles.logoutLink]}
              >
                <IconLogOut size={20} color="#F87171" />
                <Text style={[styles.drawerNavLinkText, { color: '#F87171' }]}>
                  Se déconnecter
                </Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: THEME.colors.background,
    minHeight: '100%' as any,
  },
  // Desktop Sidebar
  sidebar: {
    width: 260,
    backgroundColor: THEME.colors.navy,
    flexDirection: 'column',
    justifyContent: 'space-between',
    borderRightWidth: 1,
    borderRightColor: '#1E3A5F',
  },
  sidebarBrand: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#1E3A5F',
  },
  navScroll: {
    flex: 1,
  },
  navGroup: {
    paddingHorizontal: 12,
    paddingVertical: 16,
    gap: 4,
  },
  navLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: THEME.radii.lg,
    minHeight: 44,
  },
  navLinkActive: {
    backgroundColor: THEME.colors.primary,
  },
  navLinkHovered: {
    backgroundColor: '#1E3A5F',
  },
  navLinkLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8',
  },
  navLinkLabelActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  logoutLink: {
    marginTop: 4,
  },
  sidebarFooter: {
    paddingHorizontal: 12,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#1E3A5F',
    gap: 4,
  },
  userMiniRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    backgroundColor: '#1E3A5F',
    borderRadius: THEME.radii.lg,
    marginTop: 10,
  },
  avatarCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: THEME.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  userInfoCol: {
    flex: 1,
  },
  userNameText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  userOrgText: {
    color: '#94A3B8',
    fontSize: 11,
  },

  mainContent: {
    flex: 1,
    flexDirection: 'column',
    position: 'relative',
    height: '100%' as any,
  },
  topHeader: {
    height: 64,
    backgroundColor: THEME.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  menuIconButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitleContainer: {
    flex: 1,
  },
  pageHeaderTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.colors.navy,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  bellButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  badgeCount: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#B91C1C',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 1,
    minWidth: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeCountText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  quickCheckButton: {
    backgroundColor: THEME.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: THEME.radii.lg,
    minHeight: 38,
  },
  quickCheckButtonHovered: {
    backgroundColor: THEME.colors.primaryDark,
  },
  quickCheckText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  // Notifications
  notificationsOverlay: {
    position: 'absolute',
    top: 65,
    right: 20,
    zIndex: 99,
  },
  notificationsDropdown: {
    width: 340,
    backgroundColor: THEME.colors.surface,
    borderColor: THEME.colors.border,
    borderWidth: 1,
    borderRadius: THEME.radii.xl,
    ...THEME.shadows.lg,
    overflow: 'hidden',
  },
  notifHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
    backgroundColor: '#F8FAFC',
  },
  notifTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.colors.navy,
  },
  markReadText: {
    fontSize: 12,
    color: THEME.colors.primary,
    fontWeight: '600',
  },
  notifList: {
    maxHeight: 320,
  },
  emptyNotifText: {
    padding: 24,
    textAlign: 'center',
    color: THEME.colors.textSecondary,
    fontSize: 13,
  },
  notifItem: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
    gap: 8,
  },
  notifItemUnread: {
    backgroundColor: '#F0FDFA',
  },
  notifItemDotCol: {
    width: 8,
    paddingTop: 6,
  },
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: THEME.colors.primary,
  },
  notifItemContent: {
    flex: 1,
  },
  notifItemTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.navy,
  },
  notifItemMessage: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  notifItemTime: {
    fontSize: 10,
    color: THEME.colors.textMuted,
    marginTop: 4,
  },

  // Page Content Scroll
  pageScrollView: {
    flex: 1,
  },
  pageScrollContent: {
    padding: 24,
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
  },
  pageScrollContentMobile: {
    padding: 16,
    paddingBottom: 80,
  },

  // Mobile Bottom Tab Bar
  bottomTabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 62,
    backgroundColor: THEME.colors.surface,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    zIndex: 20,
  },
  bottomTabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    minHeight: 44,
  },
  bottomTabLabel: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  bottomTabLabelActive: {
    color: THEME.colors.primary,
    fontWeight: '700',
  },

  // Mobile Slide-Over Drawer
  mobileDrawerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
    flexDirection: 'row',
  },
  mobileDrawerBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(16, 42, 67, 0.6)',
  },
  mobileDrawerContent: {
    width: 280,
    height: '100%',
    backgroundColor: THEME.colors.navy,
    paddingTop: 20,
    paddingHorizontal: 16,
    zIndex: 101,
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1E3A5F',
  },
  drawerNavList: {
    marginTop: 16,
  },
  drawerNavLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: THEME.radii.lg,
    marginBottom: 4,
  },
  drawerNavLinkActive: {
    backgroundColor: THEME.colors.primary,
  },
  drawerNavLinkText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#94A3B8',
  },
  drawerNavLinkTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  drawerDivider: {
    height: 1,
    backgroundColor: '#1E3A5F',
    marginVertical: 12,
  },
});
