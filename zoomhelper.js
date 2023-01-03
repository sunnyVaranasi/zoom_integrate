const axios=require('axios');
const { response } = require('express');
const qs = require('qs')

const authorize = () => {
    return `https://zoom.us/oauth/authorize?response_type=code&client_id=${process.env.Zoom_CLIENT_ID}&redirect_uri=${process.env.Zoom_Redirect_URI}`
}

const redirect = async (code)=>{
    let tokenUri = 'https://zoom.us/oauth/token';
    let payload = qs.stringify({
        code: code,
        grant_type:'authorization_code',
        redirect_uri: process.env.Zoom_Redirect_URI
    });

    const { data } = await axios({
            url:tokenUri,
            method:'post',
            headers:{
                'Content-Type':'application/x-www-form-urlencoded',
                'Authorization':"Basic " + Buffer.from(`${process.env.Zoom_CLIENT_ID}:${process.env.Zoom_CLIENT_SECRET}`).toString('base64')
            },
            data:payload
    }).then(response => {
        console.log("inside response");
        console.log(response.data);
        return response;
        }).catch(error => {
        // console.log(error, "hello");
        return error;
    });
    process.env.Zoom_access_token = data?data.access_token : '';
    process.env.Zoom_refresh_token = data?data.refresh_token : ''
    console.log("Accesstoken is equal to : ", process.env.Zoom_access_token)
    return data; 
}

const refresh = async() =>{
    let tokenUri = 'https://zoom.us/oauth/token';
    let payload = qs.stringify({
        grant_type:'refresh_token',
        refresh_token: process.env.Zoom_refresh_token
    });

    const {data} = await axios({
        url:tokenUri,
        method:'post',
        headers:{
            'Content-Type':'application/x-www-form-urlencoded',
            'Authorization':"Basic " + Buffer.from(`66zIdWcETLarcH6lE3OlZw:wzeJHL7xc4oInESRuEmXGDT7JejeVH6Y`).toString('base64')
        },
        data:payload
    }).then(response => {return response}).catch(error => { return error});
    console.log(data);
    process.env.Zoom_access_token = data.access_token;
    process.env.Zoom_refresh_token = data.refresh_token;
    return data;
}


// LIST MEETING $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
const listMeeting = async()=>{
    // console.log("inside list meeting");
    let meetingUri = 'https://api.zoom.us/v2/users/me/meetings';
    // console.log(process.env.Zoom_access_token, " == zoom access token");
    const meetingList = await axios({
        url:meetingUri,
        headers:{
            Authorization:'Bearer ' + process.env.Zoom_access_token
        }
    }).then(response => {
        return response;
    }).catch(error => {
        return {data:"No response"};
    });

    return meetingList.data;
}

// GET MEETING $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
const getMeeting = async(payload) =>{
    console.log("inside getMeeting");
    let meetingUri = `https://api.zoom.us/v2/meetings/${payload.meetingId}`;
    const meetingDetail = await axios({
        url:meetingUri,
        headers:{
            Authorization:'Bearer ' + process.env.Zoom_access_token
        }
    }).then(response => {
        return response;
    }).catch(error => {
        console.log("Inside error");
        return {data:"No response"};
    });
    return meetingDetail.data;
}

// CREATE MEETING $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
const createMeeting = async (payload)=>
{
    // console.log(payload.topic);
    // console.log(payload);
    let meetingUri = 'https://api.zoom.us/v2/users/me/meetings';

    const {data} = await axios({
        url:meetingUri,
        method:'post',
        data:payload,
        headers:{
            Authorization:'Bearer ' + process.env.Zoom_access_token
        }
    }).then(response => {
        return response;
    }).catch(error => {
        console.log(error);
        return {data:"No response"};
    });

    return data;
}

// DELETE MEETING $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
const deleteMeeting = async (payload) => {
    let deleteUri = `https://api.zoom.us/v2/meetings/${payload.meetingId}`

    const deleteDetail = await axios({
        url:deleteUri,
        method:'delete',
        headers:{
            Authorization:'Bearer ' + process.env.Zoom_access_token
        },
    }).then(response => {
        return response;
    }).catch(error => {
        console.log("Inside error");
        return {data:"No response"};
    });
    return deleteDetail.data;
}







// data: {
//     code: 404,
//     message: 'Registration has not been enabled for this meeting: 88934157937.'
//   }

// You have exceeded the daily rate limit of (3) for Add meeting registrant API requests for the registrant 

const newRegistration = async(payload) =>
{
    let registrationUri = `https://api.zoom.us/v2/meetings/${process.env.Zoom_meetingId}/registrants`;
    console.log(registrationUri);
    
    // let meetingUri = "https://api.zoom.us/v2/users/me/meetings";
    
    const {data} = await axios({
        url:registrationUri,
        method:'post',
        data:payload,
        headers:{
            Authorization:'Bearer ' + process.env.Zoom_access_token
        }
    }).then(response => {
        return response;
    }).catch(error => {
        console.log(error,"error");
        return {data : "There was an error"};
        // data: {
        //     code: 200,
        //     message: 'Only available for paid users: Fs7vrDHWSZ2lircUubtcSw.'
        //   }
    });

    return data;
}

const listRegistrant = async()=>
{
    let listUri = `https://api.zoom.us/v2/meetings/${process.env.Zoom_meetingId}/registrants`;
    
    const {data} = await axios({
        url:listUri,
        method:'get',
        headers:{
            Authorization:'Bearer ' + process.env.Zoom_access_token
        }
    }).then(response => {
        return response;
    }).catch(error => {
        console.log(error,"error");
        return {data : "There was an error"};
        // data: {
        //     code: 200,
        //     message: 'Only available for paid users: Fs7vrDHWSZ2lircUubtcSw.'
        //   }
    });

    return data;
}

const myLocation = async() =>{
    global.navigator.geolocation.getCurrentPosition((data) => {
        console.log(data);
      });
}


module.exports = {
    authorize, 
    redirect,
    createMeeting,
    newRegistration, 
    refresh,
    listMeeting,
    getMeeting,
    deleteMeeting,
    listRegistrant,
    myLocation
}

// https://us06web.zoom.us/w/88934157937?tk=TfAXdmrK4dZf9Z3TFyehzVxmbjn125XdT3G5IXrciow.DQMAAAAUtOOOcRZQbjIxaDZDc1RwYWdLWXZ4THgyMHBRAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA&pwd=UGRjbDdiY0VodDE2YS9zelBuZHNtUT09"
// }

// "https://us06web.zoom.us/w/88934157937?tk=CQj7fmnwbHD-_l37w4dwD4LwH3KmKzwPEPfRUNMWXeY.DQMAAAAUtOOOcRZKdW1WT205N1J1T2lwLV9jR21BODlBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA&pwd=UGRjbDdiY0VodDE2YS9zelBuZHNtUT09"
// }