import React, { useState, useEffect } from "react";
import { View } from "react-native";
import TrendingContentScreen from "./TrendingContentScreen";
import { Storage } from "../components/Storage";
import WatchlistScreen from "./WatchlistScreen";
import * as FileSystem from "expo-file-system";
import WebView from "react-native-webview";
import { FASEL_EMAIL, FASEL_PASSWORD } from "@env";
import SearchScreen from "./SearchScreen";
import NewSettingsScreen from "./NewSettingsScreen";
import {
	BottomNavigation,
	ActivityIndicator,
	useTheme,
} from "react-native-paper";

const TabScreen = ({ navigation }) => {
	const [contentUpdated, setContentUpdated] = useState(false);
	const [loggedin, setLoggedin] = useState(false);
	const [index, setIndex] = useState(0);
	const theme = useTheme();
	const [routes] = useState([
		{
			key: "home",
			title: "Home",
			focusedIcon: "home",
			unfocusedIcon: "home-outline",
		},
		{
			key: "explore",
			title: "Explore",
			focusedIcon: "compass",
			unfocusedIcon: "compass-outline",
		},
		{
			key: "mylist",
			title: "My List",
			focusedIcon: "bookmark-minus",
			unfocusedIcon: "bookmark-minus-outline",
		},
		{
			key: "settings",
			title: "Settings",
			focusedIcon: "cog",
			unfocusedIcon: "cog-outline",
		},
	]);

	const renderScene = BottomNavigation.SceneMap({
		home: () => {
			return <TrendingContentScreen navigation={navigation} />;
		},
		explore: () => {
			return <SearchScreen navigation={navigation} />;
		},
		mylist: () => {
			return <WatchlistScreen navigation={navigation} />;
		},
		settings: () => {
			return <NewSettingsScreen navigation={navigation} />;
		},
	});

	const jsCode = `
					if (document.getElementById('yorke_user_login')) {
						document.getElementById('yorke_user_login').value='${FASEL_EMAIL}';
						document.getElementById('yorke_user_pass').value='${FASEL_PASSWORD}';
						document.getElementById('yorke_login_submit').click();
					} else {
						// pass
					}
					`;

	const fileUrls = [
		"https://raw.githubusercontent.com/N0-0NE-Dev/no-fasel-scrapers/main/output/all-content.json",
		"https://raw.githubusercontent.com/N0-0NE-Dev/no-fasel-scrapers/main/output/anime.json",
		"https://raw.githubusercontent.com/N0-0NE-Dev/no-fasel-scrapers/main/output/asian-series.json",
		"https://raw.githubusercontent.com/N0-0NE-Dev/no-fasel-scrapers/main/output/movies.json",
		"https://raw.githubusercontent.com/N0-0NE-Dev/no-fasel-scrapers/main/output/series.json",
		"https://raw.githubusercontent.com/N0-0NE-Dev/no-fasel-scrapers/main/output/trending-content.json",
		"https://raw.githubusercontent.com/N0-0NE-Dev/no-fasel-scrapers/main/output/tvshows.json",
		"https://raw.githubusercontent.com/N0-0NE-Dev/no-fasel-scrapers/main/output/arabic-series.json",
		"https://raw.githubusercontent.com/N0-0NE-Dev/no-fasel-scrapers/main/output/arabic-movies.json",
		"https://raw.githubusercontent.com/N0-0NE-Dev/no-fasel-scrapers/main/output/featured-content.json",
		"https://raw.githubusercontent.com/N0-0NE-Dev/no-fasel-scrapers/main/output/file-hashes.json",
	];

	useEffect(() => {
		fetch(
			"https://raw.githubusercontent.com/N0-0NE-Dev/no-fasel-scrapers/main/output/file-hashes.json"
		)
			.then((resp) => resp.text())
			.then((rawFetchedHashes) => {
				FileSystem.readAsStringAsync(
					FileSystem.documentDirectory + "file-hashes.json"
				)
					.then((rawExistingHashes) => {
						let progress = 0;
						const existingHashes = JSON.parse(rawExistingHashes);
						const fetchedHashes = JSON.parse(rawFetchedHashes);

						Object.keys(existingHashes).forEach((key) => {
							console.log(key);

							if (existingHashes[key] !== fetchedHashes[key]) {
								FileSystem.downloadAsync(
									`https://raw.githubusercontent.com/N0-0NE-Dev/no-fasel-scrapers/main/output/${key}.json`,
									FileSystem.documentDirectory + key + ".json"
								).then(() => progress++);
							} else {
								progress++;
							}

							if (progress === Object.keys(existingHashes).length) {
								FileSystem.downloadAsync(
									"https://raw.githubusercontent.com/N0-0NE-Dev/no-fasel-scrapers/main/output/file-hashes.json",
									FileSystem.documentDirectory + "file-hashes.json"
								).then(() => setContentUpdated(true));
							} else {
								// pass
							}
						});
					})
					.catch((e) => {
						console.error(e);
						let progress = 0;
						fileUrls.forEach((url) => {
							const fileName = url.split("/").slice(-1)[0];
							FileSystem.downloadAsync(
								url,
								FileSystem.documentDirectory + fileName
							).then(() => {
								progress++;
								if (progress === fileUrls.length) {
									setContentUpdated(true);
								} else {
									// pass
								}
							});
						});
					});
			});
	}, []);

	if (!Storage.contains("useProxy")) {
		Storage.set("useProxy", false);
	} else {
		// pass
	}

	if (!Storage.contains("resume")) {
		Storage.set("resume", JSON.stringify({}));
	} else {
		// pass
	}

	if (!Storage.contains("watchlist")) {
		Storage.set("watchlist", JSON.stringify({}));
	} else {
		// pass
	}

	const handleNavigationChange = (webViewState) => {
		if (webViewState.url === "https://www.faselhd.ws/") {
			setLoggedin(true);
		} else {
			// pass
		}
	};

	if (contentUpdated && loggedin) {
		return (
			<BottomNavigation
				navigationState={{ index, routes }}
				onIndexChange={setIndex}
				renderScene={renderScene}
				shifting={true}
			/>
		);
	} else {
		return (
			<View
				style={{
					flex: 1,
					justifyContent: "center",
					backgroundColor: theme.colors.background,
				}}
			>
				<ActivityIndicator size={50} />
				<View>
					<WebView
						source={{ uri: "https://www.faselhd.ws/account/login" }}
						injectedJavaScript={jsCode}
						sharedCookiesEnabled={true}
						onNavigationStateChange={handleNavigationChange}
					/>
				</View>
			</View>
		);
	}
};

export default TabScreen;
