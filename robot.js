
    const gestureStrategy = {
        'scissor':function (random) {
            return  random <1
        },
        'rock': function (random) {
            return random >1 && random <2
        },
        'cloth': function (random) {
            return random>2 && random <3
        }
    }
    
const game = {

        makeGesture: function () {
            let random = Math.random()*3;
            console.log(random,'---random');        
            var result =Object.keys(gestureStrategy).filter(k => {
               return gestureStrategy[k](random)
            })[0];
            this.randomGesture =  result;
            return result;
        },
        init: function (fairFn,winFn,loseFn) {
            // fair 平局回到，win 胜利回调 ，lose 输掉回调
            console.log('111111111');
            
            if(!fairFn || !winFn || !loseFn || 
                typeof fairFn !== 'function'||
                typeof winFn !== 'function'||
                typeof loseFn !== 'function') {
                return console.warn('请添加正确的结果回调')
            }
            console.log(this,'--------this');
            
            this.start = function (gesture) {
                console.log('start-------------');
                
                if(!gesture) {
                    return console.log('no gesture');
                    
                }
                if (!Object.keys(gestureStrategy).includes(gesture)) {
                    return console.warn('You need give a correct gesture');
                }
                let randomGesture = this.makeGesture();
                console.log(randomGesture,'---randomGesture');

                if(randomGesture === gesture) {
                    // console.log('平局');
                    fairFn(randomGesture);
                    
                } else if(
                    (randomGesture === 'scissor' && gesture === 'cloth') ||
                    (randomGesture === 'cloth' && gesture === 'rock') ||
                    (randomGesture === 'rock' && gesture === 'scissor'))
                    
                    {
                    // console.log(randomGesture+' VS ' + gesture, '你输了');
                    loseFn(randomGesture);
                    
                } else {
                    // console.log(randomGesture+' VS ' + gesture, '你赢了');
                    winFn(randomGesture);
                }
            }
        },

}
module.exports = game;
