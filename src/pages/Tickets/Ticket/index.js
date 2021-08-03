import React,{useEffect, useState}from 'react'
import {View,ScrollView,StyleSheet, Text, TouchableOpacity} from 'react-native'
import {HeaderForm,Btn,BtnAdd,BtnDetail,BtnAction,BtnDelete,BtnEdit,Footer,Title,Dropdown, Spinner} from '../../../component';
import { PageTicket } from '../../../component/Page';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faPlusCircle,faSearch} from '@fortawesome/free-solid-svg-icons';
import {colors,Distance} from '../../../utils'
import DropDownPicker from 'react-native-dropdown-picker';
import API from '../../../service';
import {useSelector} from 'react-redux';
import {Col, Rows, TableWrapper, Table, Row } from 'react-native-table-component';
import {useIsFocused} from '@react-navigation/native';

const Aksi =(props) => {
    return (
        <View style ={{alignItems : 'center', justifyContent :'center', width:80}}>
            <View style={{flexDirection:'row'}}>
                <BtnAction onPress={() => props.navigation.navigate('Action', {ticket_id : props.data.id})}/>
                <Distance distanceH={3}/>
                <BtnDetail onPress={() => props.navigation.navigate('ViewTicket', {ticket : props.data})}/>
            </View>
            <View style={{flexDirection:'row'}}>
                <BtnEdit onPress={() => props.navigation.navigate('EditTicket', {ticket : props.data})}/>
                <Distance distanceH={3}/>
                <BtnDelete onPress={props.delete}/>
            </View>
        </View>
    )
}


const Ticket=({navigation})=>{
    DropDownPicker.setListMode("SCROLLVIEW");
    const [loading, setLoading] = useState(true)
    const tableHead = ['No', 'Register', 'Keluhan', 'Status', 'Aksi'];
    const TOKEN = useSelector((state) => state.TokenReducer);
    const [tableNo, setTableNo] = useState()
    const [tableData, setTableData] = useState()
    const isFocused = useIsFocused();
    const [tickets, setTickets] = useState(null)
    const [status, setStatus] = useState('')
    useEffect(() => {
        let isAmounted = true
        if(isAmounted){
            ticketsAPi();
        }

        return () => {
            isAmounted = false;
        }
    }, [isFocused])

    const ticketsAPi = () => {
        API.ticktes(TOKEN).then((result) => {
            let data = []
            let no = []
            result.data.map((item, index) => {
                // console.log(Object.keys(result.data[index]));
                no[index] = index + 1;
                data[index] = [
                    item.created_at,
                    item.title,
                    item.status,
                    [<Aksi 
                            key ={index}
                            data={item} 
                            navigation={navigation} 
                            delete={() => handleDelete(item.id)}
                        />],
                ]
            })
            console.log(result);
            console.log('ticket',tickets);
                      
            setTickets( result.data)
            setTableData(data)
            setTableNo(no)
            // console.log(result);
            setLoading(false)
        }).catch((e) => {
            console.log(e.request);
            setLoading(false)
        })
    }

    const handleDelete =($id) => {
        setLoading(true)
        API.ticketsDelete($id, TOKEN).then((result) => {
            // console.log(result);
            alert(result.data.message)
            ticketsAPi();
            // setLoading(false)
        }).catch((e) => {
            console.log(e.request);
            setLoading(false)
        })
    }

    const handleFilter = () => {
        let data = []
        let no = []
        setLoading(true)
        if(status !== ''){
            tickets.map((item, index) => {
                // console.log(Object.keys(result.data[index]));
                if(item.status == status){
                    no[index] = index + 1;
                    data[index] = [
                        item.created_at,
                        item.title,
                        item.status,
                        [<Aksi 
                                key ={index}
                                data={item} 
                                navigation={navigation} 
                                delete={() => handleDelete(item.id)}
                            />],
                    ]
                }
              
            })
            setTableData(data)
            setTableNo(no)
            setLoading(false)
        }else{
            tickets.map((item, index) => {
                    no[index] = index + 1;
                    data[index] = [
                        item.created_at,
                        item.title,
                        item.status,
                        [<Aksi 
                                key ={index}
                                data={item} 
                                navigation={navigation} 
                                delete={() => handleDelete(item.id)}
                            />],
                    ]
              
            })
            setTableData(data)
            setTableNo(no)
            setLoading(false)
        }
    }

    return(
        <View style={styles.container}>
            {loading && <Spinner/>}
            <ScrollView>
                <HeaderForm/>
                <View style={{alignItems:'center', flex: 1}}>
                    <View style={{width:'90%'}}>
                        <Title title='Daftar Tiket Keluhan'/>
                        <BtnAdd
                            title="Buka Tiket"
                            width='60%'
                            icon={faPlusCircle}
                            onPress={()=>navigation.navigate('AddTicket')}
                        />
                        <Distance distanceV={10}/>
                        <View style={{flexDirection:'row'}}>
                            <Dropdown
                                placeholder='Pilih Status'
                                width='60%'
                                data={[
                                        {label: 'Semua Status', value: ''},
                                        {label: 'Pending', value: 'pending'},
                                        {label: 'Active', value: 'active'},
                                        {label: 'Close', value: 'close'}
                                ]}
                                onChangeValue = {(item) => setStatus(item)}
                            />
                            <Distance distanceH={5}/>
                            <Btn 
                                title='Filter' 
                                width='35%'
                                icon={<FontAwesomeIcon icon={faSearch} style={{color:'#FFFFFF'}} size={ 27 }/>} 
                                onPress = {handleFilter}
                            />
                        </View>

                     
                    </View>
                    <View style={{width:'100%'}}>
                    <Distance distanceV={10}/>
                        {tickets &&  
                            tickets.map((item, index) => {
                                return (
                                    <PageTicket 
                                        data={item}
                                    />
                                )
                            })
                        }
                        
                    </View>
                    
                </View>
                </ScrollView>
            <Footer navigation={navigation} focus='Home'/>
       </View>
    )
}
const styles = StyleSheet.create({
    container:{
        flex:1,
        backgroundColor:'#F4F4F4'
    },
   
    head: {  height: 50,  backgroundColor: '#EAF4FA'  },
    wrapper: { flexDirection: 'row',},
    no: { flex: 1, backgroundColor: '#ffffff' },
    row: {  height: 100  },
    text: {  alignItems:'center', margin:6,paddingHorizontal:4},
    dataWrapper: { marginTop: -1 },
})
export default Ticket
