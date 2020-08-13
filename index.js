const fs = require('fs');
const http = require('http');
const url = require('url');
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
        winNum++;
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

app.get('/game',function(req,res) {
        const query  = req.query;
        const gesture = query.gesture;
        console.log(gesture);
        
        if(gesture === 'again') {
             resultNum = 0;
             winNum = 0;
             sameCount = 0;
             lastGesture = '';
             res.writeHead(200);
             res.end('重新开始吧');
             return;
        }
        if(lastGesture && lastGesture === gesture) {
            sameCount ++;
        } else {
            sameCount = 0;
        }
        lastGesture = gesture;
        game.start(gesture);
        console.log(winNum,'----winNum','sameCount----',sameCount)
        if(winNum >= 3 || sameCount>=3) {
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






