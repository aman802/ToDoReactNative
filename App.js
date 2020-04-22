import React, { Component } from 'react';
import {
	StyleSheet,
	View,
	Text,
	FlatList,
	TouchableOpacity,
	TouchableWithoutFeedback,
	TouchableNativeFeedback,
	TextInput,
	AsyncStorage
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Modal from 'react-native-modal';
import CheckBox from 'react-native-check-box';

const colorList = [ "#f44336", "#009688", "#2196f3", "#9c27b0", "#ffc107", "#ff9800" ]

const chooseColor = (position) => {
	return colorList[position-1];
}

const CircleItem = ({ id, colorHex, isSelected, toggleSelection }) => {
	return (
		<TouchableOpacity onPress={toggleSelection(id)}>
			<View style={[ styles.circleItem , { backgroundColor: colorHex, borderColor: 'black', borderWidth: (isSelected) ? 3 : 0 }]} />
		</TouchableOpacity>
	)
}

export default class App extends Component {

	constructor(props) {
		super(props)
		this.state = {
			data: [],
			newPopupVisibility: false,
			editPopupVisibility: false,
			currentItemID: -1
		};
	}

	toggleNewItemPopup = () => {
		if (!this.state.newPopupVisibility) {
			console.log("Opening New Item Modal")
		}
		else {
			console.log("Closing New Item Modal")
		}
		this.setState((state, props) => ({
			newPopupVisibility: !state.newPopupVisibility
		}))
	}

	toggleEditItemPopup = (number) => {
		if (!this.state.newPopupVisibility) {
			console.log("Opening Edit Item Modal")
		}
		else {
			console.log("Closing Edit Item Modal")
		}
		this.setState((state, props) => ({
			editPopupVisibility: !state.editPopupVisibility,
			currentItemID: number
		}))
	}

	saveTask = async (task) => {
		console.log("Saving task")
		const existingTasks = await AsyncStorage.getItem('tasks')
		let newTasksList = JSON.parse(existingTasks)
		if (!newTasksList) {
			newTasksList = []
		}
		if (task.id == -1) {
			if (newTasksList.length == 0) {
				task.id = 1
			}
			else {
				task.id = newTasksList[length-1].id + 1
			}
		}
		task.id = task.id.toString()
		console.log("New Task: " + task)
		newTasksList.push(task)
		await AsyncStorage.setItem('tasks', JSON.stringify(newTasksList))
			.then(() => {
				console.log("Saved Successfully")
			})
			.catch(() => {
				console.log("There was an error")
			})
	}

	fetchTaskList = async () => {
		console.log("Fetching tasks")
		let storageData = await AsyncStorage.getItem('tasks')
		console.log("Storage Data:" + storageData)
		let data = JSON.parse(storageData)
		console.log("Data:" + data)
		return data
	}

	componentDidMount() {
		this.fetchTaskList()
			.then((data) => {
				console.log("Component Did Mount");
				if (data != null) {
					this.setState({data}, () => {
						console.log("Component Did Mount Data: " + data)
					})
				}
			})
			.catch((error) => {
				console.error('Promise is rejected with error: ' + error)
			})
	}

	render() {
		console.log("In Render")
		const data = this.state.data
		console.log("Data in Render: " + data)
		return (
			<View style={{ flex: 1, flexDirection: "column" }}>
				<Modal isVisible={this.state.newPopupVisibility}>
					<ModalView callType='new' togglePopup={this.toggleNewItemPopup} saveTask={this.saveTask} />
				</Modal>
				<Modal isVisible={this.state.editPopupVisibility}>
					<ModalView callType='edit' togglePopup={this.toggleEditItemPopup} item={data[this.state.currentItemID-1]} saveTask={this.saveTask} />
				</Modal>
				<Text style={{ alignSelf: 'center', fontSize: 30, marginTop: 20 }}>To - Do List</Text>
				<View style={{ height: '100%', alignItems: 'center', justifyContent: 'center' }}>
					{
						data.length == 0 && 
						<View style={{ alignItems: 'center' }}>
							<Icon name="speaker-notes-off" size={50} color='black' />
							<Text style={{ fontSize: 25, color: 'black', marginTop: 10 }}>No task added</Text>
						</View>
					}
				</View>
				<View style={{ flex: 1, marginTop: 20 }}>
					<FlatList
						data={data}
						renderItem={({ item }) => <Item item={item} toggleEditItemPopup={this.toggleEditItemPopup} />}
						keyExtractor={item => item.id} />
				</View>
				<TouchableOpacity onPress={this.toggleNewItemPopup}
					style={styles.floatingActionButton}>
					<View>
						<Icon name="add" size={40} color="#fff" />
					</View>
				</TouchableOpacity>
			</View>
		);
	}
};

class Item extends Component {
	constructor(props) {
		super(props)
		this.state = {
			isComplete: props.item.isComplete
		}
	}

	toggleCompleteState = () => {
		this.setState((state, props) => ({
			isComplete: !this.state.isComplete
		}))
	}

	render() {
		console.log("Item")
		const { text, color, id } = this.props.item
		const isComplete = this.state.isComplete
		console.log("ID: " + id)
		console.log("Text: " + text)
		console.log("Color: " + color)
		console.log("isComplete: " + isComplete)
		return (
			<TouchableNativeFeedback onPress={this.toggleCompleteState}>
				<View style={[styles.listItem,{ backgroundColor: chooseColor(color) } ]}>
					<CheckBox onClick={this.toggleCompleteState} checkBoxColor="white" isChecked={isComplete} />
					<Text style={[ styles.itemText, { textDecorationLine: (isComplete ? 'line-through' : 'none') }]} numberOfLines={1}>{text}</Text>
					<View style={{ alignSelf: 'flex-end', flexDirection: 'row' }}>
						{ !isComplete && 
							<TouchableOpacity onPress={() => this.props.toggleEditItemPopup(id)}>
								<Icon name="create" size={25} color="white" style={{ marginEnd: 10 }} />
							</TouchableOpacity>
						}
						<TouchableOpacity>
							<Icon name="delete" size={25} color="white" />
						</TouchableOpacity>
					</View>
				</View>
			</TouchableNativeFeedback>
		)
	}
}

class ModalView extends Component {
	constructor(props) {
		super(props);
		this.state = {
			text: (this.props.item) ? item.text : '',
			selectedColor: (this.props.item) ? item.color : -1
		}
	}

	onSelectColor = (number) => {
		console.log("onSelectColor: " + number)
		this.setState({
			selectedColor: number
		})
	}

	onSavePressed = () => {
		console.log("onSavePressed")
		let item = {}
		item.id = (this.props.item) ? this.props.item.id : -1
		item.text = this.state.text
		item.color = this.state.selectedColor
		item.isComplete = false
		console.log(item)
		this.props.saveTask(item)
		this.props.togglePopup(item.id)
	}

	render() {
		const isNewItemPopup = this.props.callType == 'new'
		const headerText = (isNewItemPopup ? "Add new item" : "Edit item")
		const item = this.props.item
		const { text, selectedColor } = this.state

		return (
			<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
				<View style={ styles.modalView }>
					<View style={{ flexDirection: 'row' }}>
						<Text style={ styles.modalHeaderText }>{headerText}</Text>
						<TouchableWithoutFeedback onPress={this.props.togglePopup}>
							<Icon name="close" size={30} style={{ alignSelf: 'flex-end', padding: 10 }} />
						</TouchableWithoutFeedback>
					</View>
					<View style={ styles.horizontalLine } />
					<Text style={ styles.modalSubHeading }>Task</Text>
					<TextInput style={ styles.editText } multiline={false} maxLength={40} value={text} 
						onChangeText={(text) => { this.setState({text}) }} />
					<Text style={ styles.modalSubHeading }>Colors</Text>
					<View style={ styles.circleContainerView }>
						<CircleItemClass id={1} colorHex={chooseColor(1)} isSelected={selectedColor == 1} toggleSelection={this.onSelectColor} />
						<CircleItemClass id={2} colorHex={chooseColor(2)} isSelected={selectedColor == 2} toggleSelection={this.onSelectColor} />
						<CircleItemClass id={3} colorHex={chooseColor(3)} isSelected={selectedColor == 3} toggleSelection={this.onSelectColor} />
					</View>
					<View style={styles.circleContainerView}>
						<CircleItemClass id={4} colorHex={chooseColor(4)} isSelected={selectedColor == 4} toggleSelection={this.onSelectColor} />
						<CircleItemClass id={5} colorHex={chooseColor(5)} isSelected={selectedColor == 5} toggleSelection={this.onSelectColor} />
						<CircleItemClass id={6} colorHex={chooseColor(6)} isSelected={selectedColor == 6} toggleSelection={this.onSelectColor} />
					</View>
					<TouchableOpacity onPress={this.onSavePressed} style={styles.popupSuccessButton}>
						<Text style={{ color: 'white', fontSize: 20 }}>Done</Text>
					</TouchableOpacity>
				</View>
			</View>
		)
	}
}

class CircleItemClass extends Component {
	render() {
		return (
			<TouchableOpacity onPress={() => this.props.toggleSelection(this.props.id)}>
				<View style={[ styles.circleItem , { backgroundColor: this.props.colorHex, borderColor: 'black', borderWidth: (this.props.isSelected) ? 3.5 : 0 }]} />
			</TouchableOpacity>
		)
	}
}

const styles = StyleSheet.create({
	floatingActionButton: {
		width: 60,
		height: 60,
		position: "absolute",
		bottom: 20,
		right: 20,
		backgroundColor: "#1a237e",
		borderRadius: 100,
		alignItems: 'center',
		justifyContent: 'center'
	},
	popupSuccessButton: {
		flexDirection: 'row', 
		backgroundColor: "#1a237e", 
		borderRadius: 100,
		alignItems: 'center', 
		justifyContent: 'center', 
		marginTop: 30,
		padding: 10
	},
	listItem: {
		padding: 20,
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center'
	},
	itemText: {
		flex: 1, 
		color: 'white', 
		marginStart: 10, 
		fontSize: 17
	},
	circleItem: {
		width: 40, 
		height: 40, 
		borderRadius: 100, 
		justifyContent: 'center', 
		alignItems: 'center'
	},
	modalView: {
		flexDirection: 'column', 
		width: '90%', 
		backgroundColor: 'white', 
		padding: 10
	},
	modalHeaderText: {
		flex: 1, 
		fontSize: 25, 
		textAlign: 'center', 
		padding: 10
	},
	modalSubHeading: {
		padding: 10, 
		fontSize: 20
	},
	editText: {
		padding: 10, 
		borderWidth: 1, 
		margin: 10, 
		borderRadius: 10
	},
	horizontalLine: {
		flex: 1, 
		borderTopWidth: 0.5
	},
	circleContainerView: {
		width: '100%', 
		flexDirection: 'row', 
		justifyContent: 'space-evenly',
		marginTop: 10
	}
});
