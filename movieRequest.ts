import axios from 'axios';
import * as dotenv from 'dotenv';
import * as readline from 'readline';

const userInput = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

var movieObject = {
    title: String,
    vote_average: Number,
    release_date: String,
    editors: [Array]
}

var mId
var year: any
var page = 1

var options = {
  method: 'GET',
  url: `https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=1&sort_by=popularity.desc&primary_release_year=${year}`,
  headers: {
    accept: 'application/json',
    Authorization: ''}
};

var creditOptions = {
    method: 'GET',
    url: `https://api.themoviedb.org/3/movie/${mId}/credits?language=en-US`,
    headers: {
        accept: 'application/json',
        Authorization: ''}
  };


function uInput(){
    return new Promise(resolve=>{
        userInput.question('Please input a year [YYYY]: ', input=> resolve(input))
    })
}

function cInput(){
    return new Promise(resolve=>{
        userInput.question('Would you like to see the next page?[y/n]: ', input=> resolve(input))
    })
}

function checkInput(input: any){
    if(isNaN(input as number)){
        console.error('Please input a year as a number')
        return false;
    }
    else if(input.toString().length == 4){
        return true;
    }
    else{
        console.error('Please input a four digit year with only numeric characters')
        return false;
    }
}



async function apiCall(){

    axios
    .request(options)
    .then(async res => {
        // console.log('Movies Request made')
        // console.log(res.data)

        for (let i = 0; i<res.data.results.length; i++){
            mId = res.data.results[i].id;
            creditOptions.url = `https://api.themoviedb.org/3/movie/${mId}/credits?language=en-US`;
            // console.log(mId);
            movieObject.title = res.data.results[i].title;
            movieObject.release_date = res.data.results[i].release_date
            movieObject.vote_average = res.data.results[i].vote_average

            try{
                await axios.request(creditOptions).then(async res=>{
                    // console.log('Credits request made')
                    // console.log(res.data)
                    const crew = res.data.crew;

                    let a = new Array
                    //console.log('results data length'+ crew.length)
                    for(let i=0; i<crew.length; i++){
                        //console.log(i+ ' department: '+crew[i].known_for_department)
                        if(crew[i].known_for_department == 'Editing'){
                            //console.log("YYY", crew[i].name)
                            a.push(crew[i].name)
                        }
                    }

                    if(a.length>0){
                        movieObject.editors = a
                        //console.log('Results');
                        console.log(movieObject);
                    }
                    else{
                        //console.log('Results no editors');
                        console.log(movieObject);
                    }
                })
            }
            catch(e) {
                console.log(e)
                console.error('An error has occurred when contacting the Credits API')
            }
        }

        await cInput().then(async res=>{
            if(res=='y'){
                page+=1;
                options.url = `https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=${page}&sort_by=popularity.desc&primary_release_year=${year}`;
                await apiCall()
            }
            else if(res=='n'){
                process.exit();
            }
            else{
                process.exit();
            }
        })

    })
    .catch(err => console.error(err));  
}



async function runScript(){
    
    dotenv.config()
    const bearerToken = process.env.BearerToken;
    options.headers.Authorization = 'Bearer '+bearerToken
    creditOptions.headers.Authorization = 'Bearer '+bearerToken
    await uInput().then(async result =>{
        year = Number(result);
        if(checkInput(year)){
            options.url = `https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=${page}&sort_by=popularity.desc&primary_release_year=${year}`;
        }
        else{
            userInput.close();
            process.exit(1);
        }
    });

    await apiCall()

}

runScript();