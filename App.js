import React, { useState, useEffect } from "react";
import { StyleSheet, Platform, View, Image } from "react-native";
import MapView, { Marker } from "react-native-maps";
import Constants from "expo-constants";
import * as Location from "expo-location";
import { Icon } from "react-native-elements";
import metroJson from "./json/metro.json";
import axios from "axios";
import { VictoryPie } from "victory-native";


const UBIKE_URL =
  "https://data.ntpc.gov.tw/api/datasets/71CD1490-A2DF-4198-BEF1-318479775E8A/json/preview";

const dataColor = ["#FFC408", "#E83015"];


const App = () => {
  const [region, setRegion] = useState({
    longitude: 121.544637,
    latitude: 25.024624,
    longitudeDelta: 0.01,
    latitudeDelta: 0.02,
  });
  const [marker, setMarker] = useState({
    coord: {
      longitude: 25.125632,
      latitude: 121.467102,
    },
    name: "普鱷魚",
    address: "普洱市無糖路去冰街 999號 -10樓",
  });

  const [onCurrentLocation, setOnCurrentLocation] = useState(false);
  const [metro, setMetro] = useState(metroJson);
  const [ubike, setUbike] = useState([]);

  const onRegionChangeComplete = (rgn) => {
    if (
      Math.abs(rgn.latitude - region.latitude) > 0.0002 ||
      Math.abs(rgn.longitude - region.longitude) > 0.0002
    ) {
      setRegion(rgn);
      setOnCurrentLocation(false);
    }
  };

  const getUbikeAsync = async () => {
    let response = await axios.get(UBIKE_URL);
    setUbike(response.data);
  };

  const setRegionAndMarker = (location) => {
    setRegion({
      ...region,
      longitude: location.coords.longitude,
      latitude: location.coords.latitude,
    });
    setMarker({
      ...marker,
      coord: {
        longitude: location.coords.longitude,
        latitude: location.coords.latitude,
      },
    });
  };

  const getLocation = async () => {
    let { status } = await Location.requestPermissionsAsync();
    if (status !== "granted") {
      setMsg("Permission to access location was denied");
      return;
    }
    let location = await Location.getCurrentPositionAsync({});
    setRegionAndMarker(location);
    setOnCurrentLocation(true);
  };

  useEffect(() => {
    if (Platform.OS === "android" && !Constants.isDevice) {
      setErrorMsg(
        "Oops, this will not work on Sketch in an Android emulator. Try it on your device!"
      );
    } else {
      getLocation();
      getUbikeAsync();
    }
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <MapView
        region={region}
        style={{ flex: 1 }}
        showsTraffic
        onRegionChangeComplete={onRegionChangeComplete}
      >
         {
            <Marker
            coordinate={marker.coord}
            title={marker.name}
            description={marker.address}
          >
           <Image
              source={require("./assets/dance2.png")}
              style={{ width: 35, height: 35 }}
              resizeMode="contain"
            />
          </Marker>
        }

        {metro.map((site) => (
          <Marker
            coordinate={{ latitude: site.latitude, longitude: site.longitude }}
            key={`${site.id}${site.line}`}
            title={site.name}
            description={site.address}
          >
            <Image
              source={require("./assets/subway.png")}
              style={{ width: 26, height: 28 }}
              resizeMode="contain"
            />
          </Marker>
        ))}

        {ubike.map((site) => (
          <Marker
            coordinate={{
              latitude: Number(site.lat),
              longitude: Number(site.lng),
            }}
            key={site.sno}
            title={`${site.sna} ${site.sbi}/${site.tot}`}
            description={site.address}
            >

          <VictoryPie
            radius={17}
            data={[
              {x:site.tot-site.sbi,y:100-(site.sbi/site.tot)*100},
              {x:site.sbi,y:(site.sbi/site.tot)*100},
            ]}
            colorScale={dataColor}
            innerRadius={7}
            labelRadius={10}
            />


            <Image
              source={require("./assets/bike.png")}
              style={{ width: 26, height: 28 }}
              resizeMode="contain"
            />  
            </Marker>
        ))}
    
      </MapView>
      {!onCurrentLocation && (
        <Icon
          raised
          name="ios-locate"
          type="ionicon"
          color="#00A2C8"
          containerStyle={{
            backgroundColor:"#00A2C8",
            position: "absolute",
            right: 20,
            bottom: 40,
          }}
          onPress={getLocation}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  ring: {
    width: 40,
    height: 40,
    borderRadius: 40,
    backgroundColor: "rgba(130,4,150, 0.3)",
    borderWidth: 20,
    borderColor: "rgba(130,4,150, 0.5)",
  },
});

export default App;