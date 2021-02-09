import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, Button, StyleSheet } from 'react-native';
import { VictoryBar, VictoryChart, VictoryLabel, VictoryTheme } from 'victory-native';
import * as firebase from 'firebase';
import { totalCalories, totalCaloriesWeekly, convertWeekToChart } from '../api/healthStatsMethods'
import HealthStatsScreen from './HealthStatsScreen'


export default function WeeklyHealthStatsScreen ({ navigation }) {
  const db = firebase.firestore();
  let currentUserUID = firebase.auth().currentUser.uid;
  const [calorieData, setCalorieData] = useState([])
  const [weekCalorieData, setWeekCalorieData] = useState({})

  useEffect(() => {
    const getWeeksCalories = async () => {
      let userCalories = []

      // sets beginning date to last week:
      let beginningDate = Date.now() - 604800000
      let beginningDateObject = new Date(beginningDate)
      console.log('beginningDateObj----->', beginningDateObject)
      try {
        await db.collection("routes").doc(currentUserUID).collection("sessions").where("created",">=", beginningDateObject).orderBy("created","asc").get()
        .then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            const dataObj = doc.data();
            console.log('dataObj----->', dataObj)
            const caloriesOverTime = {
              day: dataObj.created.toDate().toString().slice(0,10),
              calories: Math.round(dataObj.estCaloriesBurned)
            }
            userCalories.push(caloriesOverTime)
          })
        })
        setCalorieData(userCalories)
        console.log('calorieData array--->', userCalories)
        // aggregate calorie count for each day in the week:
        const weekTotals = totalCaloriesWeekly(userCalories)
        console.log('weekTotals', weekTotals)
        const weeklyChartData = convertWeekToChart(weekTotals)
        setWeekCalorieData(weeklyChartData)
        console.log('weekly chart data====>', weekCalorieData)
      } catch (error) {
        console.log("Error getting documents", error);
      }
    }
    getWeeksCalories();
  }, []);

  console.log('weekCalorieData----->', weekCalorieData)

  return (
    (!weekCalorieData && !calorieData) ?
    (
      <SafeAreaView>
        <Text>Loading</Text>
      </SafeAreaView>
    ) :
    (
      <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <View style={{ flexDirection: "row" }}>
          <Button title="Day"
            onPress={() => {
              console.log('button pressed')
              navigation.navigate("DailyHealthStats")
            }}
          />
          <Button title="Week"/>
          <Button title="Month"/>
        </View>
        <Text>TOTAL CALORIES BURNED: {totalCalories(calorieData)}</Text>
        <Text>AVERAGE DAILY CALORIES BURNED: {Math.round(totalCalories(calorieData) / 7)}</Text>
        {/* {weekCalorieData && (
        <VictoryChart width={350} theme={VictoryTheme.material} domainPadding={30} standalone={false}>
          <VictoryBar data={weekCalorieData} x='date' y='calories' labels={(d)=>{return d.datum.calories}} />

        </VictoryChart>
        )} */}
      </View>

      <Button title='Go back' onPress={() => navigation.goBack()} />
    </SafeAreaView>
    ))
  // return (
  //   <SafeAreaView style={styles.container}>
  //     <View style={styles.container}>
  //       <View style={{ flexDirection: "row" }}>
  //         <Button title="Day"/>
  //         <Button title="Week"
  //           // onPress={()}
  //         />
  //         <Button title="Month"/>
  //       </View>
  //       <Text>TOTAL CALORIES BURNED: {totalCalories(calorieData)}</Text>
  //       <Text>AVERAGE DAILY CALORIES BURNED: {Math.round(totalCalories(calorieData) / 7)}</Text>
  //       <VictoryChart width={350} theme={VictoryTheme.material} domainPadding={30} >
  //         <VictoryBar data={weekCalorieData} x='date' y='calories' labels={(d)=>{return d.datum.calories}} />

  //       </VictoryChart>
  //     </View>

  //     <Button title='Go back' onPress={() => navigation.goBack()} />
  //   </SafeAreaView>
  // );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
