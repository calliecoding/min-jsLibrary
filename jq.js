
//使用闭包，避免写在全局

(function(){



    //getElementsByClassName 兼容
    if(! document.getElementsByClassName){
        document.getElementsByClassName = function(eleClassName){
            var aEle = document.getElementsByTagName('*'),//通配符，获取页面所有节点
            reg = new RegExp("\\b"+eleClassName+"\\b"),
            arrEle = [];
            for(var i = 0,len=aEle.length;i<len; i++){
                if(reg.test(aEle[i].className)){ //匹配节点的className
                    arrEle.push(aEle[i]); //找到节点
                }
            }
            return arrEle
        }
    }
    

    //trim 兼容
    if(!String.prototype.trim){ //判断trim方法是否存在
        String.prototype.trim = function(){
            this.replace(/(^\s+) | ($\s+)/g, '') //用空字符串替代首位空格
        }
    }


    //阻止默认行为的兼容
    if(!Event.prototype.preventDefault){
        //低版本IE
        Event.prototype.preventDefault = function () {
            window.event.returnValue = false
        }
    }
    //阻止冒泡的兼容
    if(!Event.prototype.stopPropagation){
        //低版本IE
        Event.prototype.stopPropagation = function () {
            window.event.cancelBubble = true
        }
    }

    //将添加到dom身上的函数事件存储
    function _addEvent(data) { //data对象里面的参数：dom事件节点, type事件数组, fn事件函数
       

        /* 
        
        //一个事件名，绑定多个事件
                div.events = {
                    'click':{
                        say:fn,
                        hi:fn,
                        anonymous:[fn,fn,fn]  //为什么用数组存？因为用对象存还有取名字
                    }
                    'mouseenter':{
                        say:fn,
                        hi:fn,
                        anonymous:[fn,fn,fn]  //为什么用数组存？因为用对象存还有取名字
                    }
                }
        */

        

        //判断 data.dom.events是否存在，否：之前没有绑定过任何事件，这是第一次绑定事件
        if(typeof data.dom.events === 'undefined'){
            data.dom.events = {}
        }

        //判断之前有没有绑定过同类型事件
        if(typeof data.dom.events[data.type[0]] === 'undefined'){ //type[0]一定是事件名
            
            data.dom.events[data.type[0]]  = {} 
            data.dom.events[data.type[0]].anonymous = []; 
            //判断初始情况，给对应的值，方便后续的存储
        }

       
        //判断有没有自定义事件的名字,如[click,sayhi]
        if(typeof data.type[1] === 'undefined'){
            //匿名事件函数，存到anonymous里，形成anonymous:[fn,fn,fn]
            data.dom.events[data.type[0]].anonymous.push(data.fn)
        }else{
            //有名事件函数
            //type[0] 事件名， type[1] 事件函数名字
            /* 
                div.events = {
                    'click':{
                        say:fn,
                        hi:fn,
                        anonymous:[fn,fn,fn]  //为什么用数组存？因为用对象存还有取名字
                    }
            */
           data.dom.events[data.type[0]][data.type[1]]= data.fn
            

        }        
        
    }


    //兼容removeEventListener  
    function _removeEvent(dom, type, fn, bool){
       
        if(dom.removeEventListener){
            //主流浏览器
            dom.removeEventListener(type,fn,bool)
        }else{
            dom.detachEventListener('on'+type,fn)
        }
    }


    //工具类(构造函数)
    function Callie(selector){
        
       return new Callie.prototype.init(selector) //
    }
    
    //所有工具类都有一个 初始化的方法
    Callie.prototype = {
        constructor : Callie,

         /* init初始化，用于获取元素/包装元素，返回对象 */
        init: function(selector){
            //自定义数组,只有数组才可以遍历
            
            var arr = null;
            var obj = { //存放获取元素的方法 ，先判断是什么方法
                    id : function(selector){
                        var dom = document.getElementById(selector.slice(1))

                        //判断当前dom是不是null
                        return dom === null ? [] : [dom]
                    },

                    className : function(selector){

                        //getElementsByClassName 要做兼容
                        return document.getElementsByClassName(selector.slice(1))
                    },

                    tag : function(selector){


                        return document.getElementsByTagName(selector)
                    },
                    html : function(selector){//创建元素
                        
                         //创建一个空的div
                        var div = document.createElement('div');

                        div.innerHTML = selector;

                        div.children //取出节点，返回一个HTMLCollection集合
                    },
                    //css3 选择器
                    css3 : function(selector){
                        return document.querySelectorAll(selector)
                    },
                }
            
           
            //判断参数是哪个获取元素的方法
            
            if(typeof selector === 'string'){//进来的是选择条件
                
               //去除首尾空格
                selector = selector.trim()   //trim 只兼容到 9 ，为了兼容 IE8，所以要做兼容
                

                //判断是选择器还是创建标签  
                function isSelector (str){//str就是选择条件的字符串
                    
                    if(/^</.test(str)){ //以尖括号开头的一定是创建标签
                        return 'html'
                    }else if(/[+～>\s]/.test(str)){//判断css3 选择器: + ～ > ｜s
                        return 'css3'

                    }else if(/^\./.test(str)){ //判断单个类选择器

                        return 'className'
                    }else if(/^#/.test(str)){ //判断id选择器

                        return 'id'
                    }else if(/^\w+$/.test(str)){ //判断单个标签

                        return 'tag'
                    }
                    
                }


                //调用obj里面的函数
               arr = obj[isSelector(selector)](selector)


            }else if(typeof selector === 'Object'){
                //进来的是节点对象
                arr = [selector]; //包在数组里，数组才可以遍历
            }

            for (let i = 0; i < arr.length; i++) {
               this[i] = arr[i] 
               this.length = arr.length
            }

           /*  输出的格式
           {
                0:ele1,
                1:ele2,
            }
            */

           Callie.each(arr,function(v, i, obj){ // 回调的参数 ：当前对象 下标 原对象
               

              /*   if(i === 2){ //筛选一个 ，跳过当前循环
                    
                    return true
                  
                }else if(i > 3){ //筛选前几个， 结束整个循环

                    return false
                } */

            this[i] = v;
            // console.log(this);
            },this)

            this.length = arr.length

        },

        /* 获取或设置元素的文本内容 */
        html:function(str){
            if(Callie.type(str) === 'undefined'){ 
                //html函数中没有穿参数时，就是获取元素
                //如：$('div').html()
                var val = this[0].innerHTML
                return val

            }else{
                //设置文本内容
                //如，$('div').html('hello')
                //节点集合，遍历设置文本内容
                Callie.each(this,function(v){ //this拿到实例对象
                    v.innerHTML = str
                })
                //链式操作，返回this
                return this

            }
        },
        /* 封装on方法 */
        on:function(eventType, fn){
            
            //非字符串不做操作
            if(typeof eventType !== 'string') return;

            //去除空格，拿到有效事件名
            var arr = eventType.trim().split(/\s+/)

            //遍历实例对象  $('div')
            for (var i = 0 , len = this.length; i < len; i++) {
                //取出每个dom节点，绑定事件
                
               
                (function(i,that){
                    //that 代表当前jq对象中的元素

                     //遍历事件名，因为可能传递多个事件名 click mouseenter
                    for (var j = 0, len2 = arr.length; j < len2; j++) {
                            var type = arr[j] .split(/\./);
                            // console.log(type);
                            

                            if(type[0] === 'mousewheel'){
                                //判断是火狐还是其他浏览器事件
                                function _eventWheelFn(e) {
                                    //兼容事件对象
                                    e = e || window.event;
                                   
                                    //对方向值做处理
                                    var dir = e.wheelDelta / 120 || -e.detail / 3;

                                    //执行函数，判断return值，来阻止默认行为
                                    if(fn.call(that, e, dir) === false){
                                        e.preventDefault();
                                    }
                                }

                                //判断滚轮事件名是哪个, 对象的事件不存在时，为null
                                type[0] = (that.onmousewheel === null) ? 'mousewheel' : 'DOMMouseScroll'

                                eventFnName = _eventWheelFn
                          
                               

                            }else{  
                                //阻止事件默认行为，阻止冒泡
                                function _eventFn(e) {
                                    //兼容事件对象
                                    e = e || window.event;
                                   
                                    if( fn.call(that,e) === false){
                                        e.preventDefault();
                                    }
                                }

                                eventFnName = _eventFn
                               
                               

                            }
                            
                            //添加事件函数,因为attachEvent 默认不支持捕获，为了统一，所以addEventListener也要设置成不支持捕获
                            that.addEventListener ? that.addEventListener(type[0],eventFnName,false) : that.attachEvent('on'+ type[0],eventFnName)
                             
                            //存储对应的事件函数
                             _addEvent({
                                dom:that,
                                type:type,
                                fn:eventFnName
                            })
                        
                    }
                    
                }(i,this[i])) //传递this
                
            }

        },

         /* 封装off方法 */
        off:function(eventType){
            if(typeof eventType === 'undefined'){
                //$('div').off()
                //解绑元素上，所有事件类型，上的所有事件函数
                Callie.each(this,function(v){
                    //v 表示当前元素

                   for (var key1 in v.events) {
                       //key1 ：事件类型的名字 ，如click mouseenter
                      
                       for (var key2 in v.events[key1]) {
                           //key2 :事件函数的名字， 如sayhi:fn
                         

                           //如何解绑 anonymous 里面的匿名函数？ 遍历进行解绑
                           if(Callie.type (v.events[key1][key2]) === 'function'){ //
                                //给有名函数进行解绑
                                _removeEvent(v,key1,v.events[key1][key2],false)
                              

                           }else{
                               //给匿名函数进行解绑
                               //遍历 anonymous数组,进行解绑

                               
                               for (var j = 0, len = v.events[key1].anonymous.length;  j < len; j++) {
                                _removeEvent(v,key1,v.events[key1].anonymous[j],false)
                                   
                               }

                           }
                           
                       }


                      
                   }

                   //解绑后，释放内存
                   delete v.events;//或者v.events = {}
                })
                
                
            }else if(typeof eventType === 'string'){ //安装需求解绑事件
                //$('div').off(‘str’)
                //得到事件名数组
                var arr = eventType.trim().split(/\s+/);  //处理字符串，如['click','mouseenter']

                // console.log(arr);
                //每个数据类型都有toString方法
                //arr..toString() 实现数组降纬    [''].toString() === ''
                if(arr.toString() === ''){ //$('div').off(‘ ’)
                    return this
                }

                //对事件名数组进行遍历,
                for (var i = 0, len = arr.length; i < len; i++) {
                    //拆分事件名、事件函数
                    var type = arr[i].split(/\./) 
                    // console.log(type);//如["click", "sayhi"]
                    
                    
                    //遍历实例对象，取到节点元素，解绑元素上对应的事件
                    Callie.each(this,function(v){

                        //判断是否是火狐，修改滚动事件名
                        if(type[0] === 'mousewheel'){
                            type[0] = (v.onmousewheel === null) ? 'mousewheel' : 'DOMMouseScroll'
                        }

                        //判断事件函数，是有名函数，还是匿名函数
                        if (type.length > 1) { //如["click", "sayhi"]
                            //解绑有名的事件函数
                            _removeEvent(v,type[0],v.events[type[0]][type[1]],false)

                            //删除属性
                            delete v.events[type[0]][type[1]]
                            
                        }else{//如["click"]
                            //解绑同类型事件  ； 可以写在else里面，因为判断的时，进来的是["click"]
                            
                            //解绑同一事件类型中，的所有匿名事件，如结果click事件的所有匿名函数
                            for (var z = 0, len = v.events.length; z < len; z++) {
                                _removeEvent(v,type[0],v.events[type[0]].anonymous,false);
                            }

                            //解绑同一事件类型中，的有名的事件函数
                            for (var key3 in v.events[type[0]]) {
                                // console.log(v.events[type[0]]);
                                //判断是不是anonymous
                               if(!(v.events[type[0]][key3] instanceof Array)){ 
                                    //不是anonymous时，解绑所有函数
                                    _removeEvent(v,type[0],v.events[type[0]][key3],false)
                               }
                            }
                            // console.log(v.events[type[0]]);

                         //删除 事件类型
                         delete  v.events[type[0]]
                        }

                        console.log(v.events);
                       
                        
                    })
                    
                    
                }

            }
        }
    }


    //设置init原型 = Callie类的原型
    Callie.prototype.init.prototype = Callie.prototype


    /* 封装 each 方法
    
    静态方法
    */
    
    Callie.each = function(obj,fn, that){ // 遍历对象 回调函数 可选参数（改变this指向）

        for (let i = 0; i < obj.length; i++) {
            var bool = fn.call(that || obj[i], obj[i], i, obj) //回调函数的参数：节点对象，下标，原对象
            
            if(bool === false){

                break; //结束整个for循环
            }else if(bool === true){
                continue //跳出当前循环
            }
        }

    }

    /* 封装type 方法 */
    Callie.type = function (obj) {

        //获取object原型的toString方法
        var toString = Object.prototype.toString
       
        var type = {
            "number":'number',
            "string":'string',
            "boolean":'boolean',
            "undefined":'undefined',
            "[object RegExp]":'regExp',
            "[object Null]":'null',
            "[object Array]":'array',
            "[object Date]":'date',
            "[object Function]":'function',
            "[object Math]":'math',
            "[object Object]":'object'
        }

        
        return type[typeof obj] || type[toString.call(obj)]

    }

    
    //设置变量$为全局属性，从而在全局范围内可以访问到
    window.$ = Callie

}(window,document,undefined)) //封装工具类的时候，会把一些常用的东西传进去，因为很低版本的IE中，undefined是可以被修改的

//获取元素


/*原生JS获取元素时，返回值的规律
id获取元素时，
    获取成功时：返回单个节点标签
    没有获取到的时候，返回null

class获取元素时，
     获取成功时：返回一个HTMLCollection集合，集合里面是标签节点
     没有获取到的时候，返回一个HTMLCollection集合，集合里面是[]

tag获取元素时，
    与class获取元素相同

querySelectorAll获取元素时：
    获取成功时：返回一个NodeList集合，集合里面是标签节点
    没有获取到的时候，返回一个NodeList集合，集合里面是[]

总结：大多数返回的是一个类数组集合，只有id获取返回的单个节点



*/



/* 如何创建元素？
用户传入 $('<div></div>')时

当用户传入 $('<div><p></p></div>')
<div><p></p></div>   这部分节点要如何创建？

在body节点 放入子节点
document.body.innerHTML = '<div><p></p></div>'
通过document.body.children 获取子节点 ,返回的也是HTMLCollection集合

同理在封装时，我们可以创建一个不存在的节点，再获取它的子节点

*/


/* 判断传入的选择器，是id？className？Tag？
 
1. 传递的是字符串，说明传的是选择器
2. 进来的是对象，说明进来的是节点


*/