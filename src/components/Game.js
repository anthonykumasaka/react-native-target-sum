import React, { Component } from 'react'; 
import PropTypes from 'prop-types'; 

import { View, Text, Button, StyleSheet } from 'react-native'; 

import RandomNumber from './RandomNumber'
import shuffle from 'lodash.shuffle'

export default class Game extends Component {
    static propTypes = {
        randomNumberCount: PropTypes.number.isRequired,
        initialSeconds: PropTypes.number.isRequired,
        onPlayAgain: PropTypes.func.isRequired
    };
    state = {
        selectedIds: [], 
        remainingSeconds: this.props.initialSeconds,
    };
    gameStatus = 'PLAYING'
    randomNumbers = Array
        .from({ length: this.props.randomNumberCount})
        .map(() => 1 + Math.floor(10 * Math.random()))
    target = this.randomNumbers
        .slice(0, this.props.randomNumberCount - 2)
        .reduce((acc, curr) => acc + curr, 0)
    shuffledRandomNumbers = shuffle(this.randomNumbers); 

    componentDidMount() {
        this.intervalId = setInterval(() => {
            this.setState((prevState) => {
                return { remainingSeconds: prevState.remainingSeconds - 1 }
            }, () => {
                if (this.state.remainingSeconds === 0) {
                    clearInterval(this.intervalId)
                }
            });
        }, 1000);
    }
    componentWillUnmount() {
        clearInterval(this.intervalId); 
    }
    isNumberSelected = numberIdx => {
        return this.state.selectedIds.indexOf(numberIdx) >= 0; 
    };
    selectedNumber = numIdx => {
        this.setState(prevState => 
            ({ selectedIds: [...prevState.selectedIds, numIdx]}
        ));
    }; 
    componentWillUpdate(nextProps, nextState) {
        if(nextState.selectedIds !== this.state.selectedIds || nextState.remainingSeconds === 0) {
            this.gameStatus = this.calcGameStatus(nextState);
            if (this.gameStatus !== 'PLAYING') {
                clearInterval(this.intervalId); 
            } 
        }; 
    }
    calcGameStatus = (nextState) => {
        const sumSelected = nextState.selectedIds.reduce((acc, curr) => {
            return acc + this.shuffledRandomNumbers[curr]
        }, 0)
        if (nextState.remainingSeconds === 0) {
            return 'LOST'
        }
        if (sumSelected < this.target) {
            return 'PLAYING'
        };
        if (sumSelected === this.target) {
            return 'WON'
        };
        if (sumSelected > this.target) {
            return 'LOST'
        }
    };
    render() {
        const gameStatus = this.gameStatus; 
        return (
            <View style={styles.container}>
                <Text style={[styles.target, styles[`STATUS_${gameStatus}`]]}>{this.target}</Text>
                <View style={styles.randomContainer}>
                    {this.shuffledRandomNumbers.map((randomNumber, i) => 
                        <RandomNumber 
                        key={i} 
                        id={i}
                        number={randomNumber} 
                        isDisabled={this.isNumberSelected(i) || gameStatus !== 'PLAYING'}
                        onPress={this.selectedNumber}
                        />
                    )}
                </View>
        
                <View style={styles.timerContainer}>
                    <Text style={styles.timer}>{this.state.remainingSeconds}</Text>
                    <View style={styles.button} >
                        {this.gameStatus !== 'PLAYING' && (
                        <Button title="Play Again" onPress={this.props.onPlayAgain}/>  )}
                    </View>
                  
              
                </View>
            
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#ddd',
        flex: 1,
        paddingTop: 60
    },
    target: {
        fontSize: 40, 
        backgroundColor: '#aaa', 
        marginHorizontal: 0, 
        marginVertical: 20, 
        textAlign: 'center',
        padding: 15,
        color: 'white'
    },
    randomContainer: {
        flex: 1, 
        flexDirection: 'row', 
        flexWrap: 'wrap', 
        justifyContent: 'space-around'
    },

    STATUS_PLAYING: {
        backgroundColor: '#bbb',
    },
    STATUS_WON: {
        backgroundColor: 'green',
    },
    STATUS_LOST: {
        backgroundColor: 'red',
    },
    timerContainer: {
        flex: 1,
        alignItems: 'center',
    },
    timer: {
        fontSize: 30, 
        color: 'white',
    },
    button: {
        paddingVertical: 20,
    }

})