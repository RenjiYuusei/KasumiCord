import { isSafeMode, toggleSafeMode } from "@core/debug/safeMode";
import { Strings } from "@core/i18n";
import { kasumicordIcon } from "@core/ui/settings";
import About from "@core/ui/settings/pages/General/About";
import { useProxy } from "@core/vendetta/storage";
import { findAssetId } from "@lib/api/assets";
import { getDebugInfo } from "@lib/api/debug";
import { BundleUpdaterManager } from "@lib/api/native/modules";
import { settings } from "@lib/api/settings";
import { openAlert } from "@lib/ui/alerts";
import { DISCORD_SERVER, GITHUB } from "@lib/utils/constants";
import { NavigationNative } from "@metro/common";
import {
  AlertActionButton,
  AlertActions,
  AlertModal,
  Card,
  Stack,
  TableRow,
  TableRowGroup,
  TableSwitchRow,
  Text,
} from "@metro/common/components";
import { Linking, ScrollView, View, TouchableOpacity } from "react-native";

import React from "react";

export default function General() {
  useProxy(settings);

  const debugInfo = getDebugInfo();
  const navigation = NavigationNative.useNavigation();

  // Custom Community Card Button
  const CommunityCardButton = ({
    icon,
    label,
    subLabel,
    color,
    onPress,
  }: {
    icon?: number | { uri: string };
    label: string;
    subLabel?: string | null;
    color?: string;
    onPress?: () => void;
  }) => (
    <TouchableOpacity style={{ flex: 1 }} onPress={onPress} activeOpacity={0.7}>
      <Card
        style={{
          backgroundColor: color,
          borderRadius: 16,
          padding: 16,
          height: 100, // Increased height to accommodate text
          justifyContent: "center",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "flex-start",
            gap: 12,
          }}
        >
          <View
            style={{
              width: 32,
              height: 32,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <TableRow.Icon
              source={icon as any}
              style={{
                tintColor: "#FFFFFF",
                width: 24,
                height: 24,
              }}
            />
          </View>
          <View
            style={{
              flexDirection: "column",
              alignItems: "flex-start",
              justifyContent: "center",
              flex: 1,
            }}
          >
            <Text
              variant="text-md/semibold"
              style={{
                color: "text-default",
                textAlign: "left",
              }}
            >
              {label}
            </Text>
            {subLabel && (
              <Text
                variant="text-sm/medium"
                style={{
                  color: "#FFFFFFCC",
                  textAlign: "left",
                }}
              >
                {subLabel}
              </Text>
            )}
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingBottom: 38 }}
    >
      <Stack
        style={{ paddingVertical: 24, paddingHorizontal: 12 }}
        spacing={24}
      >
        <TableRowGroup title={Strings.APP_INFORMATION}>
          <TableRow
            label="KasumiCord"
            icon={<TableRow.Icon source={{ uri: kasumicordIcon ?? "" }} />}
            trailing={<TableRow.TrailingText text={debugInfo.bunny.version} />}
          />
          <TableRow
            label="Discord"
            subLabel={`Version ${debugInfo.discord.version}`}
            icon={<TableRow.Icon source={findAssetId("Discord")} />}
            trailing={
              <TableRow.TrailingText
                text={`Build ${debugInfo.discord.build}`}
              />
            }
          />
          <TableRow
            label="Loader"
            subLabel={`${debugInfo.bunny.loader.name} loader`}
            icon={<TableRow.Icon source={findAssetId("DownloadIcon")} />}
            trailing={
              <TableRow.TrailingText text={debugInfo.bunny.loader.version ?? ""} />
            }
          />
        </TableRowGroup>
        <TableRowGroup title={Strings.QUICK_ACTIONS}>
          <TableRow
            label={Strings.RELOAD_DISCORD}
            subLabel={Strings.RESTART_APP}
            icon={<TableRow.Icon source={findAssetId("RetryIcon")} />}
            onPress={() => BundleUpdaterManager.reload()}
          />
          <TableSwitchRow
            label={Strings.SAFE_MODE}
            subLabel={Strings.SAFE_MODE_SUB}
            icon={<TableRow.Icon source={findAssetId("ShieldIcon")} />}
            value={isSafeMode()}
            onValueChange={(to: boolean) => {
              toggleSafeMode({ to, reload: false });
              openAlert(
                "bunny-reload-safe-mode",
                <AlertModal
                  title={Strings.RELOAD_NOW_QUESTION}
                  content={
                    !to
                      ? Strings.RELOAD_NORMAL_EXPLANATION
                      : Strings.RELOAD_SAFE_EXPLANATION
                  }
                  actions={
                    <AlertActions>
                      <AlertActionButton
                        text={Strings.RELOAD_NOW}
                        variant="destructive"
                        onPress={() => BundleUpdaterManager.reload()}
                      />
                      <AlertActionButton text={Strings.LATER} variant="secondary" />
                    </AlertActions>
                  }
                />,
              );
            }}
          />
        </TableRowGroup>

        <TableRowGroup title="Developer">
          <TableSwitchRow
            label={Strings.DEVELOPER_SETTINGS}
            subLabel={Strings.ENABLE_DEV_TOOLS_SUB}
            icon={<TableRow.Icon source={findAssetId("WrenchIcon")} />}
            value={settings.developerSettings}
            onValueChange={(v: boolean) => {
              settings.developerSettings = v;
            }}
          />
          <TableSwitchRow
            label={Strings.SETTINGS_ACTIVATE_DISCORD_EXPERIMENTS}
            subLabel={Strings.SETTINGS_ACTIVATE_DISCORD_EXPERIMENTS_DESC}
            icon={<TableRow.Icon source={findAssetId("StaffBadgeIcon")} />}
            value={settings.enableDiscordDeveloperSettings}
            onValueChange={(v: boolean) => {
              settings.enableDiscordDeveloperSettings = v;
            }}
          />
        </TableRowGroup>

        <TableRowGroup title={Strings.COMMUNITY_SUPPORT}>
          <View
            style={{
              flexDirection: "row",
              gap: 12,
            }}
          >
            <CommunityCardButton
              icon={findAssetId("Discord")}
              label="Discord"
              subLabel={Strings.JOIN_SUPPORT_SERVER}
              color="#5865F2"
              onPress={() => Linking.openURL(DISCORD_SERVER)}
            />

          </View>
        </TableRowGroup>

        <TableRowGroup title={Strings.SYSTEM_INFORMATION}>
          <TableRow
            arrow
            label={Strings.ABOUT}
            subLabel={Strings.DETAILED_TECHNICAL_INFO}
            icon={
              <TableRow.Icon
                source={findAssetId("CircleInformationIcon-primary")}
              />
            }
            onPress={() =>
              navigation.push("SHIGGYCORD_CUSTOM_PAGE", {
                title: Strings.ABOUT,
                render: () => <About />,
              })
            }
          />
        </TableRowGroup>
      </Stack>
    </ScrollView>
  );
}
