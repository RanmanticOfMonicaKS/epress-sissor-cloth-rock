// 引入module 
const fs = require('fs');
const http = require('http');
const queryString = require('querystring');
const koa = require('koa');
const mount = require('koa-mount');
const game = require('./robot.js');
const app = new koa();

// 结果得分
let resultNum = 0;
// 连续胜利的次数
let winNum = 0;
//出相同手势的次数
let sameCount = 0;
// 上一次手势
let lastGesture = '';
// game.start(gesture);
// 处理游戏结果，并组装返回

// koa 并没有增加路由，路由有koa-mount插件进行管理

console.log('启动服务监听 http://localhost:3000');

// game初始化，传入参数
game.init(
    (randomGesture) => {
        console.log('平局---机器人出了：' + randomGesture);
        return resultNum = 0;
    },
    (randomGesture) => {
        console.log('你赢了---机器人出了：' + randomGesture);
        return resultNum = 1;
    },
    (randomGesture) => {
        console.log('你输了---机器人出了：' + randomGesture);
        return resultNum = -1;
    }
); // 

// 开启express服务
/* app.use(function( req, res ){
   
}) */




const gameMiddleware = new koa();

// 1.通过express进行路由管理时，能够对单个接口进行单文件管理，


// 通过app.use 内部使用mount进行路由管理 对于多中间件的路由，由koa创建一个实例 ，多次调用该实例上的use函数，进行中间件处理


app.use(
    mount('/favicon.ico', function (context) {
        // koa比express做了更极致的response处理函数
        // 因为koa使用异步函数作为中间件的实现方式
        // 所以koa可以在等待所有中间件执行完毕之后再统一处理返回值，因此可以用赋值运算符
        context.status = 200;
    })
)



// 2.使用中间件对复杂逻辑，进行分解。中间件即是对数据或者业务的线性分布处理，使其能够分开管理

app.use(
    mount('/game', gameMiddleware)
)
gameMiddleware.use(
    async function (context, next) {
        const query = context.query;
        console.log(query);
        const gesture = query.gesture;
        context.gesture = gesture;
        // 将gesture 挂载到context上，然后拆分出，重开逻辑
        if (gesture === 'again') {
            console.log('--------again-------');
            resultNum = 0;
            winNum = 0;
            sameCount =0;
            lastGesture = '';
            context.body = '重来吧';
            context.status = 200;
            return;
        }
        await next();
    }
)

gameMiddleware.use(
    async function (context, next) {
        console.log('context.gesture-------------->', context.gesture);
        if (lastGesture && lastGesture === context.gesture ) {
            sameCount++;
        } 
        console.log(lastGesture,'---',context.gesture,'---',sameCount);
        if(!lastGesture || lastGesture!== context.gesture || context.gesture === 'again') {
            sameCount =0;
        }
        lastGesture = context.gesture;
        if (sameCount > 3) {
            console.log('----------不玩1----------');
            context.status = 400;
            context.body = '再也不和你玩了1'
            return;
        }
        await next();
    }
)

gameMiddleware.use(
    async function (context, next) {
        console.log('context.playWon--------->',context.playWon);
        // 中间件洋葱模型 通过这一步的判断给出参数，影响前面中间件的判断 还是通过挂载res，req属性来实现
        if (winNum >= 3) {
            console.log('----------不玩2----------');

            context.status = 400;
            context.body = '我不和你玩了2'
            return;
        }
        await next();
        // 1、 第一个注意点，就是 当
        if (context.playWon) winNum++; // TODO 这里需要访问异步的后挂载的playWon需要在next()之后

    }
);

gameMiddleware.use(
    async function (context, next) {
        let result = null;
        console.log('-------------winNum-------->', winNum);
        let resultNum = await game.start(context.gesture);

        // 因为context.playWon 属性在异步代码之后添加。 所以其他代码需要访问playWon的时候，必须等到
        // TODO 当前中间件执行完毕之后才能在其他的中间件中访问到 

        console.log('----------胜负----------');
        await new Promise(resolve =>{
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
                            message: '你输了，loser',
                        }
                        break;
                    case 1:
                        result = {
                            code: 200,
                            message: '你赢了，牛B',
                        }
                        context.playWon = true;
                        break;
                    default:
                        break;
                }
             // 模拟计算过程
            setTimeout(() => {  
                context.status = result.code;
                context.body = result.message;
                resolve();
            }, 100);
        })
        return;
    }
);


app.use(
    mount('/', function (context) {
        console.log('path:/');
        context.body =fs.readFileSync('./index.html','utf-8') ;
        context.status = 200;
        return;
    })
) // 最后匹配基础路径

app.listen(3000);