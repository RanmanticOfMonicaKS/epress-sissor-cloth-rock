const fs = require('fs');
const http = require('http');
const queryString = require('querystring');
const express = require('express');

const app = express();
app.listen(4000);
console.log('启动服务监听 http://localhost:4000');

const game  = require('./robot.js');
game.init(  
    (randomGesture)=>{
        console.log('平局---机器人出了：'+randomGesture);
        return resultNum = 0;
    },
    (randomGesture) => {
        console.log('你赢了---机器人出了：'+randomGesture);
        return resultNum = 1;
    },
    (randomGesture) => {
        console.log('你输了---机器人出了：'+randomGesture);
        return resultNum = -1;
    }
);  // 

// 开启express服务
/* app.use(function( req, res ){
   
}) */  

let resultNum = 0;
let winNum = 0;
let sameCount = 0;
let lastGesture = '';


// game.start(gesture);
// 处理游戏结果，并组装返回
let result  = {};


// 1.通过express进行路由管理时，能够对单个接口进行单文件管理，


// 直接管理路由
app.get('/',function(req,res){
    res.status(200);  // res.status(statusCode)  默认为 res.status(statusCode);res.end();
    res.send(fs.readFileSync(__dirname+'/index.html','utf-8')); 
    // fs.createReadStream('index.html').pipe(res);
    return;
})

app.get('/favicon.ico',function(req,res){
        /* res.writeHead(200);
        fs.createReadStream('favicon.ico').pipe(res); */
        res.status(200);
        res.send('/favicon.ico');
        return;
})

// 2.使用中间件对复杂逻辑，进行分解。中间件即是对数据或者业务的线性分布处理，使其能够分开管理

app.get('/game',function(req,res,next) {
        const query  = req.query;
        const gesture = query.gesture;
        req.gesture = gesture;
        lastGesture = gesture;

        // 将geture 挂载到req上，然后拆分出，重开逻辑
        if(gesture === 'again') {
             resultNum = 0;
             winNum = 0;
             sameCount = 0;
             lastGesture = '';
             res.writeHead(200);
             res.end('重新开始吧');
             return;
        }
        next();
    },function(req, res, next) {

        if(lastGesture && lastGesture === req.gesture) {
            sameCount ++;
        } else {
            sameCount = 0;
        }
        next();
    },
    function(req, res, next) {
        
        game.start(req.gesture).then(r => {console.log(r);if(r=1){res.playWon =true;}});
        // 中间件洋葱模型 通过这一步的判断给出参数，影响前面中间件的判断 还是通过挂载res，req属性来实现
        if(res.playWon) winNum ++; 
        console.log(winNum,'----winNum','sameCount----',sameCount)
        if(winNum >= 3 || sameCount>3) {
            res.status(400).send('我不和你玩了')
            return;
    
        } else {
            switch (resultNum) {
                case 0:
                    result = {
                        code: 200,
                        message: '旗鼓相当的对手',
                    }
                    break;
                case -1:
                result = {
                    code: 200,
                    message: '你输了，loseer',
                }
                break;
                case 1:
                    result = {
                        code: 200,
                        message: '你赢了，牛B',
                    }
                    break;
                default:
                    break;
            }
            
            
        }
        /* res.writeHead(result.code);
        res.end(result.message); */
        res.status(result.code).send(result.message);
    })






