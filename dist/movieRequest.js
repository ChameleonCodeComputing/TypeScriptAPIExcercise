"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const dotenv = __importStar(require("dotenv"));
const readline = __importStar(require("readline"));
const userInput = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
var movieObject = {
    title: String,
    vote_average: Number,
    release_date: String,
    editors: [Array]
};
var mId;
var year;
var page = 1;
var options = {
    method: 'GET',
    url: `https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=1&sort_by=popularity.desc&primary_release_year=${year}`,
    headers: {
        accept: 'application/json',
        Authorization: ''
    }
};
var creditOptions = {
    method: 'GET',
    url: `https://api.themoviedb.org/3/movie/${mId}/credits?language=en-US`,
    headers: {
        accept: 'application/json',
        Authorization: ''
    }
};
function uInput() {
    return new Promise(resolve => {
        userInput.question('Please input a year [YYYY]: ', input => resolve(input));
    });
}
function cInput() {
    return new Promise(resolve => {
        userInput.question('Would you like to see the next page?[y/n]: ', input => resolve(input));
    });
}
function checkInput(input) {
    if (isNaN(input)) {
        console.error('Please input a year as a number');
        return false;
    }
    else if (input.toString().length == 4) {
        return true;
    }
    else {
        console.error('Please input a four digit year with only numeric characters');
        return false;
    }
}
function apiCall() {
    return __awaiter(this, void 0, void 0, function* () {
        axios_1.default
            .request(options)
            .then((res) => __awaiter(this, void 0, void 0, function* () {
            // console.log('Movies Request made')
            // console.log(res.data)
            for (let i = 0; i < res.data.results.length; i++) {
                mId = res.data.results[i].id;
                creditOptions.url = `https://api.themoviedb.org/3/movie/${mId}/credits?language=en-US`;
                // console.log(mId);
                movieObject.title = res.data.results[i].title;
                movieObject.release_date = res.data.results[i].release_date;
                movieObject.vote_average = res.data.results[i].vote_average;
                try {
                    yield axios_1.default.request(creditOptions).then((res) => __awaiter(this, void 0, void 0, function* () {
                        // console.log('Credits request made')
                        // console.log(res.data)
                        const crew = res.data.crew;
                        let a = new Array;
                        //console.log('results data length'+ crew.length)
                        for (let i = 0; i < crew.length; i++) {
                            //console.log(i+ ' department: '+crew[i].known_for_department)
                            if (crew[i].known_for_department == 'Editing') {
                                //console.log("YYY", crew[i].name)
                                a.push(crew[i].name);
                            }
                        }
                        if (a.length > 0) {
                            movieObject.editors = a;
                            //console.log('Results');
                            console.log(movieObject);
                        }
                        else {
                            //console.log('Results no editors');
                            console.log(movieObject);
                        }
                    }));
                }
                catch (e) {
                    console.log(e);
                    console.error('An error has occurred when contacting the Credits API');
                }
            }
            yield cInput().then((res) => __awaiter(this, void 0, void 0, function* () {
                if (res == 'y') {
                    page += 1;
                    options.url = `https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=${page}&sort_by=popularity.desc&primary_release_year=${year}`;
                    yield apiCall();
                }
                else if (res == 'n') {
                    process.exit();
                }
                else {
                    process.exit();
                }
            }));
        }))
            .catch(err => console.error(err));
    });
}
function runScript() {
    return __awaiter(this, void 0, void 0, function* () {
        dotenv.config();
        const bearerToken = process.env.BearerToken;
        options.headers.Authorization = 'Bearer ' + bearerToken;
        creditOptions.headers.Authorization = 'Bearer ' + bearerToken;
        yield uInput().then((result) => __awaiter(this, void 0, void 0, function* () {
            year = Number(result);
            if (checkInput(year)) {
                options.url = `https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=${page}&sort_by=popularity.desc&primary_release_year=${year}`;
            }
            else {
                userInput.close();
                process.exit(1);
            }
        }));
        yield apiCall();
        // await cInput().then(async res=>{
        //     if(res=='y'){
        //         page+=1;
        //         options.url = `https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=${page}&sort_by=popularity.desc&primary_release_year=${year}`;
        //         await apiCall()
        //     }
        //     else if(res=='n'){
        //         process.exit();
        //     }
        //     else{
        //         process.exit();
        //     }
        // })
    });
}
runScript();
