import { faPlusCircle, faSearch } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useIsFocused } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Dimensions, FlatList, SafeAreaView, StyleSheet, Text, TextInput, View, Alert, Image } from 'react-native';
import { useSelector } from 'react-redux';
import { Btn, BtnAdd, BtnDelete,BtnAction, BtnDetail, BtnEdit, Footer, HeaderForm, Spinner, Title} from '../../../component';
import API from '../../../service';
import { colors, Distance } from '../../../utils';
import Config from 'react-native-config';

const TextInfo = (props) => {
    return (
            <View style={{paddingBottom:5}}>
                <View style={{flexDirection:'column',height:'auto'}}>
                    <View style={{flexDirection:'row'}}>
                        <View style={{flex:1, }}>
                            <Text style={styles.textTiltle}>{props.title}</Text>
                        </View>
                        <View style={{flex:1}}>
                            <Text style={styles.textTiltle}>:</Text>
                        </View>
                    </View>
                    <View style={{flex:1,flexDirection:'row'}}>
                        <Text style={styles.textItem}>{props.item}</Text>
                    </View>
                </View>
            </View>
    )
}

const Ticket=({navigation})=>{
    const [loading, setLoading] = useState(true)
    const TOKEN = useSelector((state) => state.TokenReducer);
    const [ticket, setTicket] = useState([]);
    const [page, setPage] = useState(1)
    const [cari, setCari] = useState()
    const [lastPage, setLastPage] = useState()
    const isFocused = useIsFocused();
    const [loadingImage, setLoadingImage] = useState(true)

    var resetData = false;

    const handleLoadMore = () => {
        if(page < lastPage){
            setPage(page + 1);
        }
    }

    useEffect(() => {
        if(isFocused){
            setLoading(true)
            getData()
        }else{
            setPage(1)
            setTicket([])
        }
        
    },[isFocused,page])
   
    const getData = async () => {
        // alert('asasjasjn')
        // console.log(resetData);
        API.ticketList({'page' : page, status : cari},TOKEN).then((result) => {
            console.log('hasil',result)
            if(page > 1){
                setTicket(ticket.concat(result.data.data)) 
                // resetData = false
            }else{       
                setTicket(result.data.data)
                console.log('delete');
            }
            setLastPage(result.data.last_page)
            setLoading(false)
        }).catch(e =>{ 
            console.log(e.request)
            // setRefresh(false)
            setLoading(false)
        })
        // console.log(page);
    };

    const filter = () => {
        resetData = true
        getData();
        // alert('handle filter')
    }

    const handleDelete =($id, item) => {
        Alert.alert(
           'Peringatan',
           `Apakah anda yakin untuk menghapus ` +item.code+'?',
           [
               {
                   text : 'Tidak',
                   onPress : () => console.log('tidak')
               },
               {
                   text : 'Ya',
                   onPress : () => {
                       setLoading(true)
                       API.ticketsDelete($id, TOKEN).then((result) => {
                           resetData = true;
                           setPage(1)
                           getData();
                           alert(result.data.message)
                           setLoading(false)
                       }).catch((e) => {
                           console.log(e.request);
                           setLoading(false)
                       })
                   }
               }
           ]
         )
   }

   const ItemSeparatorView = () => {
    return (
      // Flat List Item Separator
      <View
        style={{
          marginVertical : 10
        }}
      />
    );
  };

  const renderItem = ({item}) => {
    const imagefoto = (JSON.parse(item.ticket_image[0].image)[0])
    var colorStatus = '';
    var borderStatus ='';
    if(item.status == 'active'){
        var colorStatus = '#7DE74B';
        var borderStatus = '#CAFEC0'
        
    }else if(item.status == 'pending'){
        var colorStatus = '#F0D63C';
        var borderStatus = '#FFF6C2'
    }else{
        var colorStatus = '#2392D7';
        var borderStatus ='#CFEDFF'
    }

    // console.log('foto ini',imagefoto)
    return(
        <View style={{alignItems:'center'}}>
             <View style={{backgroundColor:colorStatus, width:200, height:35,borderTopRightRadius:15,borderTopLeftRadius:15,alignItems:'center'}}>
                 <Text style={styles.textStatus}>{item.status}</Text>
             </View>
                <View style={[styles.content,{borderColor:borderStatus}]}>
                    <View style={{flexDirection:'row'}}>
                        <View style={{flex:1,height:200, paddingTop:3}}>
                            {loadingImage && <Image source={require('../../../assets/img/ImageFotoLoading.png')} style={{width:150, height:200}}/>}
                            <Image 
                                source={{uri : Config.REACT_APP_BASE_URL + `${String(imagefoto).replace('public/', '')}`}} 
                                style={{flex:1}}
                                onLoadEnd={() => setLoadingImage(false)}
                                onLoadStart={() => setLoadingImage(true)}
                            />
                        </View>
                        <View style={[styles.textnfo, {flex:1}]}>
                            <TextInfo title = 'Tanggal' item={item.created_at}/>
                            <TextInfo title = 'Nama' item ={item.customer.namapelanggan}/>
                            <TextInfo title = 'Code' item={item.code}/>
                            <TextInfo title = 'Kategori' item={item.category.name}/>
                            <TextInfo title = 'Deskripsi' item={item.description}/>
                        </View>
                    </View>
                    <View style={{flex:1, flexDirection:'row', justifyContent:'flex-end'}}>
                        <View style={{flexDirection:'row',width:'85%',height:'auto',paddingTop:5}}>
                            <BtnDetail onPress={() => navigation.navigate('ViewTicket', {ticket : item})}/>
                            <BtnAction onPress={() => navigation.navigate('Action', {ticket_id : item.id})}/>
                            <BtnEdit onPress={() => navigation.navigate('EditTicket', {ticket : item})}/>
                            <BtnDelete onPress={() => handleDelete(item.id, item)}/>
                        </View>
                    </View>
                </View>
        </View>
    )
}
    return (
        <SafeAreaView style={{flex : 1}}>
        {loading && <Spinner/>}
       <View style={styles.container}>
           
           {/* header */}
           <HeaderForm/>
           <View style={{paddingHorizontal : 20}}>
               <Title title='Tiket'/>
               <BtnAdd
                   title="Tambah Tiket"
                   width='60%'
                   icon={faPlusCircle}
                    onPress={()=>navigation.navigate('AddTicket')}
               />        
               <Distance distanceV={10}/>
               <View style={{flexDirection:'row'}}>
                   <TextInput style={styles.search} value={cari} onChangeText={(item) => setFind(item)} ></TextInput>
                   <Distance distanceH={5}/>
                   <Btn 
                       title='Filter' 
                       width='35%'
                       icon={<FontAwesomeIcon icon={faSearch} style={{color:'#FFFFFF'}} size={ 27 }/>} 
                       onPress={() => {setPage(1); filter()}}
                   />
               </View>    
               <Distance distanceV={10}/>        
           </View>
           {/*batas headxer  */}

           <FlatList
               keyExtractor={(item, index) => index.toString()}
               data={ticket}
               ItemSeparatorComponent={ItemSeparatorView}
               contentContainerStyle={{alignItems : 'center'}}
               renderItem={renderItem}
               ListFooterComponent={loading ? <Text>Sedang Memuat</Text> : null}
               onEndReached={handleLoadMore}
               onEndReachedThreshold={0}
               // onRefresh={onRefresh}
               // refreshing={refresh}
           />
       </View>
       <Footer navigation={navigation} focus='Menu'/>
  </SafeAreaView>
    )
}
const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        flex: 1,
        backgroundColor:'#ffffff'
    },
    content : {
        borderWidth : 3,
        width : Dimensions.get('screen').width - 45,
        borderRadius : 10,
        padding:10
        // marginVertical : 20
    },
    search : {
        backgroundColor:'#ffffff',
        width : '60%',
        borderRadius : 4,
        borderWidth : 1,
        borderColor : colors.border,
        paddingHorizontal:20
    },
    textnfo : {
        paddingHorizontal : 10,   
    },
    textTiltle : {
        fontWeight : 'bold',
        fontSize : 15,
        color:'#696969'
    },
    textItem : {
        fontSize : 15,
        color:'#696969'
    },
    textStatus:{
        color:'#FFFFFF', 
        fontSize:20, 
        alignItems:'center', 
        justifyContent:'center', 
        fontWeight:'bold',
        paddingTop:5
    },
})
export default Ticket