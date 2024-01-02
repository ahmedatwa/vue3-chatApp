(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))r(a);new MutationObserver(a=>{for(const i of a)if(i.type==="childList")for(const o of i.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&r(o)}).observe(document,{childList:!0,subtree:!0});function n(a){const i={};return a.integrity&&(i.integrity=a.integrity),a.referrerPolicy&&(i.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?i.credentials="include":a.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function r(a){if(a.ep)return;a.ep=!0;const i=n(a);fetch(a.href,i)}})();function va(e,t){const n=Object.create(null),r=e.split(",");for(let a=0;a<r.length;a++)n[r[a]]=!0;return t?a=>!!n[a.toLowerCase()]:a=>!!n[a]}const ne={},jt=[],Me=()=>{},ll=()=>!1,cl=/^on[^a-z]/,dr=e=>cl.test(e),ba=e=>e.startsWith("onUpdate:"),fe=Object.assign,ya=(e,t)=>{const n=e.indexOf(t);n>-1&&e.splice(n,1)},fl=Object.prototype.hasOwnProperty,Y=(e,t)=>fl.call(e,t),H=Array.isArray,on=e=>mr(e)==="[object Map]",ul=e=>mr(e)==="[object Set]",B=e=>typeof e=="function",me=e=>typeof e=="string",xa=e=>typeof e=="symbol",ie=e=>e!==null&&typeof e=="object",Ro=e=>ie(e)&&B(e.then)&&B(e.catch),dl=Object.prototype.toString,mr=e=>dl.call(e),ml=e=>mr(e).slice(8,-1),pl=e=>mr(e)==="[object Object]",_a=e=>me(e)&&e!=="NaN"&&e[0]!=="-"&&""+parseInt(e,10)===e,Kn=va(",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"),pr=e=>{const t=Object.create(null);return n=>t[n]||(t[n]=e(n))},hl=/-(\w)/g,Ye=pr(e=>e.replace(hl,(t,n)=>n?n.toUpperCase():"")),gl=/\B([A-Z])/g,qt=pr(e=>e.replace(gl,"-$1").toLowerCase()),hr=pr(e=>e.charAt(0).toUpperCase()+e.slice(1)),Sr=pr(e=>e?`on${hr(e)}`:""),pn=(e,t)=>!Object.is(e,t),Rr=(e,t)=>{for(let n=0;n<e.length;n++)e[n](t)},nr=(e,t,n)=>{Object.defineProperty(e,t,{configurable:!0,enumerable:!1,value:n})},vl=e=>{const t=parseFloat(e);return isNaN(t)?e:t};let si;const Ur=()=>si||(si=typeof globalThis<"u"?globalThis:typeof self<"u"?self:typeof window<"u"?window:typeof global<"u"?global:{});function wa(e){if(H(e)){const t={};for(let n=0;n<e.length;n++){const r=e[n],a=me(r)?_l(r):wa(r);if(a)for(const i in a)t[i]=a[i]}return t}else{if(me(e))return e;if(ie(e))return e}}const bl=/;(?![^(]*\))/g,yl=/:([^]+)/,xl=/\/\*[^]*?\*\//g;function _l(e){const t={};return e.replace(xl,"").split(bl).forEach(n=>{if(n){const r=n.split(yl);r.length>1&&(t[r[0].trim()]=r[1].trim())}}),t}function Ea(e){let t="";if(me(e))t=e;else if(H(e))for(let n=0;n<e.length;n++){const r=Ea(e[n]);r&&(t+=r+" ")}else if(ie(e))for(const n in e)e[n]&&(t+=n+" ");return t.trim()}const wl="itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly",El=va(wl);function Io(e){return!!e||e===""}let Ce;class To{constructor(t=!1){this.detached=t,this._active=!0,this.effects=[],this.cleanups=[],this.parent=Ce,!t&&Ce&&(this.index=(Ce.scopes||(Ce.scopes=[])).push(this)-1)}get active(){return this._active}run(t){if(this._active){const n=Ce;try{return Ce=this,t()}finally{Ce=n}}}on(){Ce=this}off(){Ce=this.parent}stop(t){if(this._active){let n,r;for(n=0,r=this.effects.length;n<r;n++)this.effects[n].stop();for(n=0,r=this.cleanups.length;n<r;n++)this.cleanups[n]();if(this.scopes)for(n=0,r=this.scopes.length;n<r;n++)this.scopes[n].stop(!0);if(!this.detached&&this.parent&&!t){const a=this.parent.scopes.pop();a&&a!==this&&(this.parent.scopes[this.index]=a,a.index=this.index)}this.parent=void 0,this._active=!1}}}function kl(e){return new To(e)}function Al(e,t=Ce){t&&t.active&&t.effects.push(e)}function Ol(){return Ce}const ka=e=>{const t=new Set(e);return t.w=0,t.n=0,t},No=e=>(e.w&mt)>0,Mo=e=>(e.n&mt)>0,Pl=({deps:e})=>{if(e.length)for(let t=0;t<e.length;t++)e[t].w|=mt},Cl=e=>{const{deps:t}=e;if(t.length){let n=0;for(let r=0;r<t.length;r++){const a=t[r];No(a)&&!Mo(a)?a.delete(e):t[n++]=a,a.w&=~mt,a.n&=~mt}t.length=n}},Wr=new WeakMap;let nn=0,mt=1;const Yr=30;let Re;const kt=Symbol(""),Kr=Symbol("");class Aa{constructor(t,n=null,r){this.fn=t,this.scheduler=n,this.active=!0,this.deps=[],this.parent=void 0,Al(this,r)}run(){if(!this.active)return this.fn();let t=Re,n=ut;for(;t;){if(t===this)return;t=t.parent}try{return this.parent=Re,Re=this,ut=!0,mt=1<<++nn,nn<=Yr?Pl(this):li(this),this.fn()}finally{nn<=Yr&&Cl(this),mt=1<<--nn,Re=this.parent,ut=n,this.parent=void 0,this.deferStop&&this.stop()}}stop(){Re===this?this.deferStop=!0:this.active&&(li(this),this.onStop&&this.onStop(),this.active=!1)}}function li(e){const{deps:t}=e;if(t.length){for(let n=0;n<t.length;n++)t[n].delete(e);t.length=0}}let ut=!0;const Lo=[];function Vt(){Lo.push(ut),ut=!1}function Xt(){const e=Lo.pop();ut=e===void 0?!0:e}function we(e,t,n){if(ut&&Re){let r=Wr.get(e);r||Wr.set(e,r=new Map);let a=r.get(n);a||r.set(n,a=ka()),Fo(a)}}function Fo(e,t){let n=!1;nn<=Yr?Mo(e)||(e.n|=mt,n=!No(e)):n=!e.has(Re),n&&(e.add(Re),Re.deps.push(e))}function Je(e,t,n,r,a,i){const o=Wr.get(e);if(!o)return;let l=[];if(t==="clear")l=[...o.values()];else if(n==="length"&&H(e)){const s=Number(r);o.forEach((f,c)=>{(c==="length"||c>=s)&&l.push(f)})}else switch(n!==void 0&&l.push(o.get(n)),t){case"add":H(e)?_a(n)&&l.push(o.get("length")):(l.push(o.get(kt)),on(e)&&l.push(o.get(Kr)));break;case"delete":H(e)||(l.push(o.get(kt)),on(e)&&l.push(o.get(Kr)));break;case"set":on(e)&&l.push(o.get(kt));break}if(l.length===1)l[0]&&qr(l[0]);else{const s=[];for(const f of l)f&&s.push(...f);qr(ka(s))}}function qr(e,t){const n=H(e)?e:[...e];for(const r of n)r.computed&&ci(r);for(const r of n)r.computed||ci(r)}function ci(e,t){(e!==Re||e.allowRecurse)&&(e.scheduler?e.scheduler():e.run())}const Sl=va("__proto__,__v_isRef,__isVue"),jo=new Set(Object.getOwnPropertyNames(Symbol).filter(e=>e!=="arguments"&&e!=="caller").map(e=>Symbol[e]).filter(xa)),Rl=Oa(),Il=Oa(!1,!0),Tl=Oa(!0),fi=Nl();function Nl(){const e={};return["includes","indexOf","lastIndexOf"].forEach(t=>{e[t]=function(...n){const r=K(this);for(let i=0,o=this.length;i<o;i++)we(r,"get",i+"");const a=r[t](...n);return a===-1||a===!1?r[t](...n.map(K)):a}}),["push","pop","shift","unshift","splice"].forEach(t=>{e[t]=function(...n){Vt();const r=K(this)[t].apply(this,n);return Xt(),r}}),e}function Ml(e){const t=K(this);return we(t,"has",e),t.hasOwnProperty(e)}function Oa(e=!1,t=!1){return function(r,a,i){if(a==="__v_isReactive")return!e;if(a==="__v_isReadonly")return e;if(a==="__v_isShallow")return t;if(a==="__v_raw"&&i===(e?t?Gl:Bo:t?Ho:Do).get(r))return r;const o=H(r);if(!e){if(o&&Y(fi,a))return Reflect.get(fi,a,i);if(a==="hasOwnProperty")return Ml}const l=Reflect.get(r,a,i);return(xa(a)?jo.has(a):Sl(a))||(e||we(r,"get",a),t)?l:ge(l)?o&&_a(a)?l:l.value:ie(l)?e?Wo(l):vr(l):l}}const Ll=zo(),Fl=zo(!0);function zo(e=!1){return function(n,r,a,i){let o=n[r];if(Ht(o)&&ge(o)&&!ge(a))return!1;if(!e&&(!rr(a)&&!Ht(a)&&(o=K(o),a=K(a)),!H(n)&&ge(o)&&!ge(a)))return o.value=a,!0;const l=H(n)&&_a(r)?Number(r)<n.length:Y(n,r),s=Reflect.set(n,r,a,i);return n===K(i)&&(l?pn(a,o)&&Je(n,"set",r,a):Je(n,"add",r,a)),s}}function jl(e,t){const n=Y(e,t);e[t];const r=Reflect.deleteProperty(e,t);return r&&n&&Je(e,"delete",t,void 0),r}function zl(e,t){const n=Reflect.has(e,t);return(!xa(t)||!jo.has(t))&&we(e,"has",t),n}function $l(e){return we(e,"iterate",H(e)?"length":kt),Reflect.ownKeys(e)}const $o={get:Rl,set:Ll,deleteProperty:jl,has:zl,ownKeys:$l},Dl={get:Tl,set(e,t){return!0},deleteProperty(e,t){return!0}},Hl=fe({},$o,{get:Il,set:Fl}),Pa=e=>e,gr=e=>Reflect.getPrototypeOf(e);function In(e,t,n=!1,r=!1){e=e.__v_raw;const a=K(e),i=K(t);n||(t!==i&&we(a,"get",t),we(a,"get",i));const{has:o}=gr(a),l=r?Pa:n?Ia:hn;if(o.call(a,t))return l(e.get(t));if(o.call(a,i))return l(e.get(i));e!==a&&e.get(t)}function Tn(e,t=!1){const n=this.__v_raw,r=K(n),a=K(e);return t||(e!==a&&we(r,"has",e),we(r,"has",a)),e===a?n.has(e):n.has(e)||n.has(a)}function Nn(e,t=!1){return e=e.__v_raw,!t&&we(K(e),"iterate",kt),Reflect.get(e,"size",e)}function ui(e){e=K(e);const t=K(this);return gr(t).has.call(t,e)||(t.add(e),Je(t,"add",e,e)),this}function di(e,t){t=K(t);const n=K(this),{has:r,get:a}=gr(n);let i=r.call(n,e);i||(e=K(e),i=r.call(n,e));const o=a.call(n,e);return n.set(e,t),i?pn(t,o)&&Je(n,"set",e,t):Je(n,"add",e,t),this}function mi(e){const t=K(this),{has:n,get:r}=gr(t);let a=n.call(t,e);a||(e=K(e),a=n.call(t,e)),r&&r.call(t,e);const i=t.delete(e);return a&&Je(t,"delete",e,void 0),i}function pi(){const e=K(this),t=e.size!==0,n=e.clear();return t&&Je(e,"clear",void 0,void 0),n}function Mn(e,t){return function(r,a){const i=this,o=i.__v_raw,l=K(o),s=t?Pa:e?Ia:hn;return!e&&we(l,"iterate",kt),o.forEach((f,c)=>r.call(a,s(f),s(c),i))}}function Ln(e,t,n){return function(...r){const a=this.__v_raw,i=K(a),o=on(i),l=e==="entries"||e===Symbol.iterator&&o,s=e==="keys"&&o,f=a[e](...r),c=n?Pa:t?Ia:hn;return!t&&we(i,"iterate",s?Kr:kt),{next(){const{value:d,done:p}=f.next();return p?{value:d,done:p}:{value:l?[c(d[0]),c(d[1])]:c(d),done:p}},[Symbol.iterator](){return this}}}}function ot(e){return function(...t){return e==="delete"?!1:this}}function Bl(){const e={get(i){return In(this,i)},get size(){return Nn(this)},has:Tn,add:ui,set:di,delete:mi,clear:pi,forEach:Mn(!1,!1)},t={get(i){return In(this,i,!1,!0)},get size(){return Nn(this)},has:Tn,add:ui,set:di,delete:mi,clear:pi,forEach:Mn(!1,!0)},n={get(i){return In(this,i,!0)},get size(){return Nn(this,!0)},has(i){return Tn.call(this,i,!0)},add:ot("add"),set:ot("set"),delete:ot("delete"),clear:ot("clear"),forEach:Mn(!0,!1)},r={get(i){return In(this,i,!0,!0)},get size(){return Nn(this,!0)},has(i){return Tn.call(this,i,!0)},add:ot("add"),set:ot("set"),delete:ot("delete"),clear:ot("clear"),forEach:Mn(!0,!0)};return["keys","values","entries",Symbol.iterator].forEach(i=>{e[i]=Ln(i,!1,!1),n[i]=Ln(i,!0,!1),t[i]=Ln(i,!1,!0),r[i]=Ln(i,!0,!0)}),[e,n,t,r]}const[Ul,Wl,Yl,Kl]=Bl();function Ca(e,t){const n=t?e?Kl:Yl:e?Wl:Ul;return(r,a,i)=>a==="__v_isReactive"?!e:a==="__v_isReadonly"?e:a==="__v_raw"?r:Reflect.get(Y(n,a)&&a in r?n:r,a,i)}const ql={get:Ca(!1,!1)},Vl={get:Ca(!1,!0)},Xl={get:Ca(!0,!1)},Do=new WeakMap,Ho=new WeakMap,Bo=new WeakMap,Gl=new WeakMap;function Ql(e){switch(e){case"Object":case"Array":return 1;case"Map":case"Set":case"WeakMap":case"WeakSet":return 2;default:return 0}}function Jl(e){return e.__v_skip||!Object.isExtensible(e)?0:Ql(ml(e))}function vr(e){return Ht(e)?e:Sa(e,!1,$o,ql,Do)}function Uo(e){return Sa(e,!1,Hl,Vl,Ho)}function Wo(e){return Sa(e,!0,Dl,Xl,Bo)}function Sa(e,t,n,r,a){if(!ie(e)||e.__v_raw&&!(t&&e.__v_isReactive))return e;const i=a.get(e);if(i)return i;const o=Jl(e);if(o===0)return e;const l=new Proxy(e,o===2?r:n);return a.set(e,l),l}function zt(e){return Ht(e)?zt(e.__v_raw):!!(e&&e.__v_isReactive)}function Ht(e){return!!(e&&e.__v_isReadonly)}function rr(e){return!!(e&&e.__v_isShallow)}function Yo(e){return zt(e)||Ht(e)}function K(e){const t=e&&e.__v_raw;return t?K(t):e}function Ra(e){return nr(e,"__v_skip",!0),e}const hn=e=>ie(e)?vr(e):e,Ia=e=>ie(e)?Wo(e):e;function Ko(e){ut&&Re&&(e=K(e),Fo(e.dep||(e.dep=ka())))}function qo(e,t){e=K(e);const n=e.dep;n&&qr(n)}function ge(e){return!!(e&&e.__v_isRef===!0)}function Vo(e){return Xo(e,!1)}function Zl(e){return Xo(e,!0)}function Xo(e,t){return ge(e)?e:new ec(e,t)}class ec{constructor(t,n){this.__v_isShallow=n,this.dep=void 0,this.__v_isRef=!0,this._rawValue=n?t:K(t),this._value=n?t:hn(t)}get value(){return Ko(this),this._value}set value(t){const n=this.__v_isShallow||rr(t)||Ht(t);t=n?t:K(t),pn(t,this._rawValue)&&(this._rawValue=t,this._value=n?t:hn(t),qo(this))}}function Ge(e){return ge(e)?e.value:e}const tc={get:(e,t,n)=>Ge(Reflect.get(e,t,n)),set:(e,t,n,r)=>{const a=e[t];return ge(a)&&!ge(n)?(a.value=n,!0):Reflect.set(e,t,n,r)}};function Go(e){return zt(e)?e:new Proxy(e,tc)}class nc{constructor(t,n,r,a){this._setter=n,this.dep=void 0,this.__v_isRef=!0,this.__v_isReadonly=!1,this._dirty=!0,this.effect=new Aa(t,()=>{this._dirty||(this._dirty=!0,qo(this))}),this.effect.computed=this,this.effect.active=this._cacheable=!a,this.__v_isReadonly=r}get value(){const t=K(this);return Ko(t),(t._dirty||!t._cacheable)&&(t._dirty=!1,t._value=t.effect.run()),t._value}set value(t){this._setter(t)}}function rc(e,t,n=!1){let r,a;const i=B(e);return i?(r=e,a=Me):(r=e.get,a=e.set),new nc(r,a,i||!a,n)}function dt(e,t,n,r){let a;try{a=r?e(...r):e()}catch(i){br(i,t,n)}return a}function Le(e,t,n,r){if(B(e)){const i=dt(e,t,n,r);return i&&Ro(i)&&i.catch(o=>{br(o,t,n)}),i}const a=[];for(let i=0;i<e.length;i++)a.push(Le(e[i],t,n,r));return a}function br(e,t,n,r=!0){const a=t?t.vnode:null;if(t){let i=t.parent;const o=t.proxy,l=n;for(;i;){const f=i.ec;if(f){for(let c=0;c<f.length;c++)if(f[c](e,o,l)===!1)return}i=i.parent}const s=t.appContext.config.errorHandler;if(s){dt(s,null,10,[e,o,l]);return}}ac(e,n,a,r)}function ac(e,t,n,r=!0){console.error(e)}let gn=!1,Vr=!1;const he=[];let Ue=0;const $t=[];let Ve=null,xt=0;const Qo=Promise.resolve();let Ta=null;function Jo(e){const t=Ta||Qo;return e?t.then(this?e.bind(this):e):t}function ic(e){let t=Ue+1,n=he.length;for(;t<n;){const r=t+n>>>1;vn(he[r])<e?t=r+1:n=r}return t}function Na(e){(!he.length||!he.includes(e,gn&&e.allowRecurse?Ue+1:Ue))&&(e.id==null?he.push(e):he.splice(ic(e.id),0,e),Zo())}function Zo(){!gn&&!Vr&&(Vr=!0,Ta=Qo.then(ts))}function oc(e){const t=he.indexOf(e);t>Ue&&he.splice(t,1)}function sc(e){H(e)?$t.push(...e):(!Ve||!Ve.includes(e,e.allowRecurse?xt+1:xt))&&$t.push(e),Zo()}function hi(e,t=gn?Ue+1:0){for(;t<he.length;t++){const n=he[t];n&&n.pre&&(he.splice(t,1),t--,n())}}function es(e){if($t.length){const t=[...new Set($t)];if($t.length=0,Ve){Ve.push(...t);return}for(Ve=t,Ve.sort((n,r)=>vn(n)-vn(r)),xt=0;xt<Ve.length;xt++)Ve[xt]();Ve=null,xt=0}}const vn=e=>e.id==null?1/0:e.id,lc=(e,t)=>{const n=vn(e)-vn(t);if(n===0){if(e.pre&&!t.pre)return-1;if(t.pre&&!e.pre)return 1}return n};function ts(e){Vr=!1,gn=!0,he.sort(lc);const t=Me;try{for(Ue=0;Ue<he.length;Ue++){const n=he[Ue];n&&n.active!==!1&&dt(n,null,14)}}finally{Ue=0,he.length=0,es(),gn=!1,Ta=null,(he.length||$t.length)&&ts()}}function cc(e,t,...n){if(e.isUnmounted)return;const r=e.vnode.props||ne;let a=n;const i=t.startsWith("update:"),o=i&&t.slice(7);if(o&&o in r){const c=`${o==="modelValue"?"model":o}Modifiers`,{number:d,trim:p}=r[c]||ne;p&&(a=n.map(g=>me(g)?g.trim():g)),d&&(a=n.map(vl))}let l,s=r[l=Sr(t)]||r[l=Sr(Ye(t))];!s&&i&&(s=r[l=Sr(qt(t))]),s&&Le(s,e,6,a);const f=r[l+"Once"];if(f){if(!e.emitted)e.emitted={};else if(e.emitted[l])return;e.emitted[l]=!0,Le(f,e,6,a)}}function ns(e,t,n=!1){const r=t.emitsCache,a=r.get(e);if(a!==void 0)return a;const i=e.emits;let o={},l=!1;if(!B(e)){const s=f=>{const c=ns(f,t,!0);c&&(l=!0,fe(o,c))};!n&&t.mixins.length&&t.mixins.forEach(s),e.extends&&s(e.extends),e.mixins&&e.mixins.forEach(s)}return!i&&!l?(ie(e)&&r.set(e,null),null):(H(i)?i.forEach(s=>o[s]=null):fe(o,i),ie(e)&&r.set(e,o),o)}function yr(e,t){return!e||!dr(t)?!1:(t=t.slice(2).replace(/Once$/,""),Y(e,t[0].toLowerCase()+t.slice(1))||Y(e,qt(t))||Y(e,t))}let Ie=null,rs=null;function ar(e){const t=Ie;return Ie=e,rs=e&&e.type.__scopeId||null,t}function qn(e,t=Ie,n){if(!t||e._n)return e;const r=(...a)=>{r._d&&Oi(-1);const i=ar(t);let o;try{o=e(...a)}finally{ar(i),r._d&&Oi(1)}return o};return r._n=!0,r._c=!0,r._d=!0,r}function Ir(e){const{type:t,vnode:n,proxy:r,withProxy:a,props:i,propsOptions:[o],slots:l,attrs:s,emit:f,render:c,renderCache:d,data:p,setupState:g,ctx:P,inheritAttrs:C}=e;let F,x;const _=ar(e);try{if(n.shapeFlag&4){const S=a||r;F=Be(c.call(S,S,d,i,g,p,P)),x=s}else{const S=t;F=Be(S.length>1?S(i,{attrs:s,slots:l,emit:f}):S(i,null)),x=t.props?s:fc(s)}}catch(S){cn.length=0,br(S,e,1),F=se(bn)}let L=F;if(x&&C!==!1){const S=Object.keys(x),{shapeFlag:U}=L;S.length&&U&7&&(o&&S.some(ba)&&(x=uc(x,o)),L=Bt(L,x))}return n.dirs&&(L=Bt(L),L.dirs=L.dirs?L.dirs.concat(n.dirs):n.dirs),n.transition&&(L.transition=n.transition),F=L,ar(_),F}const fc=e=>{let t;for(const n in e)(n==="class"||n==="style"||dr(n))&&((t||(t={}))[n]=e[n]);return t},uc=(e,t)=>{const n={};for(const r in e)(!ba(r)||!(r.slice(9)in t))&&(n[r]=e[r]);return n};function dc(e,t,n){const{props:r,children:a,component:i}=e,{props:o,children:l,patchFlag:s}=t,f=i.emitsOptions;if(t.dirs||t.transition)return!0;if(n&&s>=0){if(s&1024)return!0;if(s&16)return r?gi(r,o,f):!!o;if(s&8){const c=t.dynamicProps;for(let d=0;d<c.length;d++){const p=c[d];if(o[p]!==r[p]&&!yr(f,p))return!0}}}else return(a||l)&&(!l||!l.$stable)?!0:r===o?!1:r?o?gi(r,o,f):!0:!!o;return!1}function gi(e,t,n){const r=Object.keys(t);if(r.length!==Object.keys(e).length)return!0;for(let a=0;a<r.length;a++){const i=r[a];if(t[i]!==e[i]&&!yr(n,i))return!0}return!1}function mc({vnode:e,parent:t},n){for(;t&&t.subTree===e;)(e=t.vnode).el=n,t=t.parent}const pc=e=>e.__isSuspense;function hc(e,t){t&&t.pendingBranch?H(e)?t.effects.push(...e):t.effects.push(e):sc(e)}const Fn={};function sn(e,t,n){return as(e,t,n)}function as(e,t,{immediate:n,deep:r,flush:a,onTrack:i,onTrigger:o}=ne){var l;const s=Ol()===((l=de)==null?void 0:l.scope)?de:null;let f,c=!1,d=!1;if(ge(e)?(f=()=>e.value,c=rr(e)):zt(e)?(f=()=>e,r=!0):H(e)?(d=!0,c=e.some(S=>zt(S)||rr(S)),f=()=>e.map(S=>{if(ge(S))return S.value;if(zt(S))return Mt(S);if(B(S))return dt(S,s,2)})):B(e)?t?f=()=>dt(e,s,2):f=()=>{if(!(s&&s.isUnmounted))return p&&p(),Le(e,s,3,[g])}:f=Me,t&&r){const S=f;f=()=>Mt(S())}let p,g=S=>{p=_.onStop=()=>{dt(S,s,4)}},P;if(xn)if(g=Me,t?n&&Le(t,s,3,[f(),d?[]:void 0,g]):f(),a==="sync"){const S=uf();P=S.__watcherHandles||(S.__watcherHandles=[])}else return Me;let C=d?new Array(e.length).fill(Fn):Fn;const F=()=>{if(_.active)if(t){const S=_.run();(r||c||(d?S.some((U,J)=>pn(U,C[J])):pn(S,C)))&&(p&&p(),Le(t,s,3,[S,C===Fn?void 0:d&&C[0]===Fn?[]:C,g]),C=S)}else _.run()};F.allowRecurse=!!t;let x;a==="sync"?x=F:a==="post"?x=()=>_e(F,s&&s.suspense):(F.pre=!0,s&&(F.id=s.uid),x=()=>Na(F));const _=new Aa(f,x);t?n?F():C=_.run():a==="post"?_e(_.run.bind(_),s&&s.suspense):_.run();const L=()=>{_.stop(),s&&s.scope&&ya(s.scope.effects,_)};return P&&P.push(L),L}function gc(e,t,n){const r=this.proxy,a=me(e)?e.includes(".")?is(r,e):()=>r[e]:e.bind(r,r);let i;B(t)?i=t:(i=t.handler,n=t);const o=de;Ut(this);const l=as(a,i.bind(r),n);return o?Ut(o):At(),l}function is(e,t){const n=t.split(".");return()=>{let r=e;for(let a=0;a<n.length&&r;a++)r=r[n[a]];return r}}function Mt(e,t){if(!ie(e)||e.__v_skip||(t=t||new Set,t.has(e)))return e;if(t.add(e),ge(e))Mt(e.value,t);else if(H(e))for(let n=0;n<e.length;n++)Mt(e[n],t);else if(ul(e)||on(e))e.forEach(n=>{Mt(n,t)});else if(pl(e))for(const n in e)Mt(e[n],t);return e}function bt(e,t,n,r){const a=e.dirs,i=t&&t.dirs;for(let o=0;o<a.length;o++){const l=a[o];i&&(l.oldValue=i[o].value);let s=l.dir[r];s&&(Vt(),Le(s,n,8,[e.el,l,e,t]),Xt())}}function Gt(e,t){return B(e)?(()=>fe({name:e.name},t,{setup:e}))():e}const Vn=e=>!!e.type.__asyncLoader,os=e=>e.type.__isKeepAlive;function vc(e,t){ss(e,"a",t)}function bc(e,t){ss(e,"da",t)}function ss(e,t,n=de){const r=e.__wdc||(e.__wdc=()=>{let a=n;for(;a;){if(a.isDeactivated)return;a=a.parent}return e()});if(xr(t,r,n),n){let a=n.parent;for(;a&&a.parent;)os(a.parent.vnode)&&yc(r,t,n,a),a=a.parent}}function yc(e,t,n,r){const a=xr(t,e,r,!0);ls(()=>{ya(r[t],a)},n)}function xr(e,t,n=de,r=!1){if(n){const a=n[e]||(n[e]=[]),i=t.__weh||(t.__weh=(...o)=>{if(n.isUnmounted)return;Vt(),Ut(n);const l=Le(t,n,e,o);return At(),Xt(),l});return r?a.unshift(i):a.push(i),i}}const nt=e=>(t,n=de)=>(!xn||e==="sp")&&xr(e,(...r)=>t(...r),n),xc=nt("bm"),_c=nt("m"),wc=nt("bu"),Ec=nt("u"),kc=nt("bum"),ls=nt("um"),Ac=nt("sp"),Oc=nt("rtg"),Pc=nt("rtc");function Cc(e,t=de){xr("ec",e,t)}const cs="components";function Sc(e,t){return Ic(cs,e,!0,t)||e}const Rc=Symbol.for("v-ndc");function Ic(e,t,n=!0,r=!1){const a=Ie||de;if(a){const i=a.type;if(e===cs){const l=lf(i,!1);if(l&&(l===t||l===Ye(t)||l===hr(Ye(t))))return i}const o=vi(a[e]||i[e],t)||vi(a.appContext[e],t);return!o&&r?i:o}}function vi(e,t){return e&&(e[t]||e[Ye(t)]||e[hr(Ye(t))])}const Xr=e=>e?ys(e)?Da(e)||e.proxy:Xr(e.parent):null,ln=fe(Object.create(null),{$:e=>e,$el:e=>e.vnode.el,$data:e=>e.data,$props:e=>e.props,$attrs:e=>e.attrs,$slots:e=>e.slots,$refs:e=>e.refs,$parent:e=>Xr(e.parent),$root:e=>Xr(e.root),$emit:e=>e.emit,$options:e=>Ma(e),$forceUpdate:e=>e.f||(e.f=()=>Na(e.update)),$nextTick:e=>e.n||(e.n=Jo.bind(e.proxy)),$watch:e=>gc.bind(e)}),Tr=(e,t)=>e!==ne&&!e.__isScriptSetup&&Y(e,t),Tc={get({_:e},t){const{ctx:n,setupState:r,data:a,props:i,accessCache:o,type:l,appContext:s}=e;let f;if(t[0]!=="$"){const g=o[t];if(g!==void 0)switch(g){case 1:return r[t];case 2:return a[t];case 4:return n[t];case 3:return i[t]}else{if(Tr(r,t))return o[t]=1,r[t];if(a!==ne&&Y(a,t))return o[t]=2,a[t];if((f=e.propsOptions[0])&&Y(f,t))return o[t]=3,i[t];if(n!==ne&&Y(n,t))return o[t]=4,n[t];Gr&&(o[t]=0)}}const c=ln[t];let d,p;if(c)return t==="$attrs"&&we(e,"get",t),c(e);if((d=l.__cssModules)&&(d=d[t]))return d;if(n!==ne&&Y(n,t))return o[t]=4,n[t];if(p=s.config.globalProperties,Y(p,t))return p[t]},set({_:e},t,n){const{data:r,setupState:a,ctx:i}=e;return Tr(a,t)?(a[t]=n,!0):r!==ne&&Y(r,t)?(r[t]=n,!0):Y(e.props,t)||t[0]==="$"&&t.slice(1)in e?!1:(i[t]=n,!0)},has({_:{data:e,setupState:t,accessCache:n,ctx:r,appContext:a,propsOptions:i}},o){let l;return!!n[o]||e!==ne&&Y(e,o)||Tr(t,o)||(l=i[0])&&Y(l,o)||Y(r,o)||Y(ln,o)||Y(a.config.globalProperties,o)},defineProperty(e,t,n){return n.get!=null?e._.accessCache[t]=0:Y(n,"value")&&this.set(e,t,n.value,null),Reflect.defineProperty(e,t,n)}};function bi(e){return H(e)?e.reduce((t,n)=>(t[n]=null,t),{}):e}let Gr=!0;function Nc(e){const t=Ma(e),n=e.proxy,r=e.ctx;Gr=!1,t.beforeCreate&&yi(t.beforeCreate,e,"bc");const{data:a,computed:i,methods:o,watch:l,provide:s,inject:f,created:c,beforeMount:d,mounted:p,beforeUpdate:g,updated:P,activated:C,deactivated:F,beforeDestroy:x,beforeUnmount:_,destroyed:L,unmounted:S,render:U,renderTracked:J,renderTriggered:re,errorCaptured:Ee,serverPrefetch:ve,expose:Oe,inheritAttrs:at,components:vt,directives:je,filters:Jt}=t;if(f&&Mc(f,r,null),o)for(const Q in o){const q=o[Q];B(q)&&(r[Q]=q.bind(n))}if(a){const Q=a.call(n,n);ie(Q)&&(e.data=vr(Q))}if(Gr=!0,i)for(const Q in i){const q=i[Q],Ke=B(q)?q.bind(n,n):B(q.get)?q.get.bind(n,n):Me,it=!B(q)&&B(q.set)?q.set.bind(n):Me,ze=ue({get:Ke,set:it});Object.defineProperty(r,Q,{enumerable:!0,configurable:!0,get:()=>ze.value,set:ye=>ze.value=ye})}if(l)for(const Q in l)fs(l[Q],r,n,Q);if(s){const Q=B(s)?s.call(n):s;Reflect.ownKeys(Q).forEach(q=>{Xn(q,Q[q])})}c&&yi(c,e,"c");function ce(Q,q){H(q)?q.forEach(Ke=>Q(Ke.bind(n))):q&&Q(q.bind(n))}if(ce(xc,d),ce(_c,p),ce(wc,g),ce(Ec,P),ce(vc,C),ce(bc,F),ce(Cc,Ee),ce(Pc,J),ce(Oc,re),ce(kc,_),ce(ls,S),ce(Ac,ve),H(Oe))if(Oe.length){const Q=e.exposed||(e.exposed={});Oe.forEach(q=>{Object.defineProperty(Q,q,{get:()=>n[q],set:Ke=>n[q]=Ke})})}else e.exposed||(e.exposed={});U&&e.render===Me&&(e.render=U),at!=null&&(e.inheritAttrs=at),vt&&(e.components=vt),je&&(e.directives=je)}function Mc(e,t,n=Me){H(e)&&(e=Qr(e));for(const r in e){const a=e[r];let i;ie(a)?"default"in a?i=Qe(a.from||r,a.default,!0):i=Qe(a.from||r):i=Qe(a),ge(i)?Object.defineProperty(t,r,{enumerable:!0,configurable:!0,get:()=>i.value,set:o=>i.value=o}):t[r]=i}}function yi(e,t,n){Le(H(e)?e.map(r=>r.bind(t.proxy)):e.bind(t.proxy),t,n)}function fs(e,t,n,r){const a=r.includes(".")?is(n,r):()=>n[r];if(me(e)){const i=t[e];B(i)&&sn(a,i)}else if(B(e))sn(a,e.bind(n));else if(ie(e))if(H(e))e.forEach(i=>fs(i,t,n,r));else{const i=B(e.handler)?e.handler.bind(n):t[e.handler];B(i)&&sn(a,i,e)}}function Ma(e){const t=e.type,{mixins:n,extends:r}=t,{mixins:a,optionsCache:i,config:{optionMergeStrategies:o}}=e.appContext,l=i.get(t);let s;return l?s=l:!a.length&&!n&&!r?s=t:(s={},a.length&&a.forEach(f=>ir(s,f,o,!0)),ir(s,t,o)),ie(t)&&i.set(t,s),s}function ir(e,t,n,r=!1){const{mixins:a,extends:i}=t;i&&ir(e,i,n,!0),a&&a.forEach(o=>ir(e,o,n,!0));for(const o in t)if(!(r&&o==="expose")){const l=Lc[o]||n&&n[o];e[o]=l?l(e[o],t[o]):t[o]}return e}const Lc={data:xi,props:_i,emits:_i,methods:rn,computed:rn,beforeCreate:be,created:be,beforeMount:be,mounted:be,beforeUpdate:be,updated:be,beforeDestroy:be,beforeUnmount:be,destroyed:be,unmounted:be,activated:be,deactivated:be,errorCaptured:be,serverPrefetch:be,components:rn,directives:rn,watch:jc,provide:xi,inject:Fc};function xi(e,t){return t?e?function(){return fe(B(e)?e.call(this,this):e,B(t)?t.call(this,this):t)}:t:e}function Fc(e,t){return rn(Qr(e),Qr(t))}function Qr(e){if(H(e)){const t={};for(let n=0;n<e.length;n++)t[e[n]]=e[n];return t}return e}function be(e,t){return e?[...new Set([].concat(e,t))]:t}function rn(e,t){return e?fe(Object.create(null),e,t):t}function _i(e,t){return e?H(e)&&H(t)?[...new Set([...e,...t])]:fe(Object.create(null),bi(e),bi(t??{})):t}function jc(e,t){if(!e)return t;if(!t)return e;const n=fe(Object.create(null),e);for(const r in t)n[r]=be(e[r],t[r]);return n}function us(){return{app:null,config:{isNativeTag:ll,performance:!1,globalProperties:{},optionMergeStrategies:{},errorHandler:void 0,warnHandler:void 0,compilerOptions:{}},mixins:[],components:{},directives:{},provides:Object.create(null),optionsCache:new WeakMap,propsCache:new WeakMap,emitsCache:new WeakMap}}let zc=0;function $c(e,t){return function(r,a=null){B(r)||(r=fe({},r)),a!=null&&!ie(a)&&(a=null);const i=us(),o=new Set;let l=!1;const s=i.app={_uid:zc++,_component:r,_props:a,_container:null,_context:i,_instance:null,version:df,get config(){return i.config},set config(f){},use(f,...c){return o.has(f)||(f&&B(f.install)?(o.add(f),f.install(s,...c)):B(f)&&(o.add(f),f(s,...c))),s},mixin(f){return i.mixins.includes(f)||i.mixins.push(f),s},component(f,c){return c?(i.components[f]=c,s):i.components[f]},directive(f,c){return c?(i.directives[f]=c,s):i.directives[f]},mount(f,c,d){if(!l){const p=se(r,a);return p.appContext=i,c&&t?t(p,f):e(p,f,d),l=!0,s._container=f,f.__vue_app__=s,Da(p.component)||p.component.proxy}},unmount(){l&&(e(null,s._container),delete s._container.__vue_app__)},provide(f,c){return i.provides[f]=c,s},runWithContext(f){or=s;try{return f()}finally{or=null}}};return s}}let or=null;function Xn(e,t){if(de){let n=de.provides;const r=de.parent&&de.parent.provides;r===n&&(n=de.provides=Object.create(r)),n[e]=t}}function Qe(e,t,n=!1){const r=de||Ie;if(r||or){const a=r?r.parent==null?r.vnode.appContext&&r.vnode.appContext.provides:r.parent.provides:or._context.provides;if(a&&e in a)return a[e];if(arguments.length>1)return n&&B(t)?t.call(r&&r.proxy):t}}function Dc(e,t,n,r=!1){const a={},i={};nr(i,wr,1),e.propsDefaults=Object.create(null),ds(e,t,a,i);for(const o in e.propsOptions[0])o in a||(a[o]=void 0);n?e.props=r?a:Uo(a):e.type.props?e.props=a:e.props=i,e.attrs=i}function Hc(e,t,n,r){const{props:a,attrs:i,vnode:{patchFlag:o}}=e,l=K(a),[s]=e.propsOptions;let f=!1;if((r||o>0)&&!(o&16)){if(o&8){const c=e.vnode.dynamicProps;for(let d=0;d<c.length;d++){let p=c[d];if(yr(e.emitsOptions,p))continue;const g=t[p];if(s)if(Y(i,p))g!==i[p]&&(i[p]=g,f=!0);else{const P=Ye(p);a[P]=Jr(s,l,P,g,e,!1)}else g!==i[p]&&(i[p]=g,f=!0)}}}else{ds(e,t,a,i)&&(f=!0);let c;for(const d in l)(!t||!Y(t,d)&&((c=qt(d))===d||!Y(t,c)))&&(s?n&&(n[d]!==void 0||n[c]!==void 0)&&(a[d]=Jr(s,l,d,void 0,e,!0)):delete a[d]);if(i!==l)for(const d in i)(!t||!Y(t,d))&&(delete i[d],f=!0)}f&&Je(e,"set","$attrs")}function ds(e,t,n,r){const[a,i]=e.propsOptions;let o=!1,l;if(t)for(let s in t){if(Kn(s))continue;const f=t[s];let c;a&&Y(a,c=Ye(s))?!i||!i.includes(c)?n[c]=f:(l||(l={}))[c]=f:yr(e.emitsOptions,s)||(!(s in r)||f!==r[s])&&(r[s]=f,o=!0)}if(i){const s=K(n),f=l||ne;for(let c=0;c<i.length;c++){const d=i[c];n[d]=Jr(a,s,d,f[d],e,!Y(f,d))}}return o}function Jr(e,t,n,r,a,i){const o=e[n];if(o!=null){const l=Y(o,"default");if(l&&r===void 0){const s=o.default;if(o.type!==Function&&!o.skipFactory&&B(s)){const{propsDefaults:f}=a;n in f?r=f[n]:(Ut(a),r=f[n]=s.call(null,t),At())}else r=s}o[0]&&(i&&!l?r=!1:o[1]&&(r===""||r===qt(n))&&(r=!0))}return r}function ms(e,t,n=!1){const r=t.propsCache,a=r.get(e);if(a)return a;const i=e.props,o={},l=[];let s=!1;if(!B(e)){const c=d=>{s=!0;const[p,g]=ms(d,t,!0);fe(o,p),g&&l.push(...g)};!n&&t.mixins.length&&t.mixins.forEach(c),e.extends&&c(e.extends),e.mixins&&e.mixins.forEach(c)}if(!i&&!s)return ie(e)&&r.set(e,jt),jt;if(H(i))for(let c=0;c<i.length;c++){const d=Ye(i[c]);wi(d)&&(o[d]=ne)}else if(i)for(const c in i){const d=Ye(c);if(wi(d)){const p=i[c],g=o[d]=H(p)||B(p)?{type:p}:fe({},p);if(g){const P=Ai(Boolean,g.type),C=Ai(String,g.type);g[0]=P>-1,g[1]=C<0||P<C,(P>-1||Y(g,"default"))&&l.push(d)}}}const f=[o,l];return ie(e)&&r.set(e,f),f}function wi(e){return e[0]!=="$"}function Ei(e){const t=e&&e.toString().match(/^\s*(function|class) (\w+)/);return t?t[2]:e===null?"null":""}function ki(e,t){return Ei(e)===Ei(t)}function Ai(e,t){return H(t)?t.findIndex(n=>ki(n,e)):B(t)&&ki(t,e)?0:-1}const ps=e=>e[0]==="_"||e==="$stable",La=e=>H(e)?e.map(Be):[Be(e)],Bc=(e,t,n)=>{if(t._n)return t;const r=qn((...a)=>La(t(...a)),n);return r._c=!1,r},hs=(e,t,n)=>{const r=e._ctx;for(const a in e){if(ps(a))continue;const i=e[a];if(B(i))t[a]=Bc(a,i,r);else if(i!=null){const o=La(i);t[a]=()=>o}}},gs=(e,t)=>{const n=La(t);e.slots.default=()=>n},Uc=(e,t)=>{if(e.vnode.shapeFlag&32){const n=t._;n?(e.slots=K(t),nr(t,"_",n)):hs(t,e.slots={})}else e.slots={},t&&gs(e,t);nr(e.slots,wr,1)},Wc=(e,t,n)=>{const{vnode:r,slots:a}=e;let i=!0,o=ne;if(r.shapeFlag&32){const l=t._;l?n&&l===1?i=!1:(fe(a,t),!n&&l===1&&delete a._):(i=!t.$stable,hs(t,a)),o=t}else t&&(gs(e,t),o={default:1});if(i)for(const l in a)!ps(l)&&!(l in o)&&delete a[l]};function Zr(e,t,n,r,a=!1){if(H(e)){e.forEach((p,g)=>Zr(p,t&&(H(t)?t[g]:t),n,r,a));return}if(Vn(r)&&!a)return;const i=r.shapeFlag&4?Da(r.component)||r.component.proxy:r.el,o=a?null:i,{i:l,r:s}=e,f=t&&t.r,c=l.refs===ne?l.refs={}:l.refs,d=l.setupState;if(f!=null&&f!==s&&(me(f)?(c[f]=null,Y(d,f)&&(d[f]=null)):ge(f)&&(f.value=null)),B(s))dt(s,l,12,[o,c]);else{const p=me(s),g=ge(s);if(p||g){const P=()=>{if(e.f){const C=p?Y(d,s)?d[s]:c[s]:s.value;a?H(C)&&ya(C,i):H(C)?C.includes(i)||C.push(i):p?(c[s]=[i],Y(d,s)&&(d[s]=c[s])):(s.value=[i],e.k&&(c[e.k]=s.value))}else p?(c[s]=o,Y(d,s)&&(d[s]=o)):g&&(s.value=o,e.k&&(c[e.k]=o))};o?(P.id=-1,_e(P,n)):P()}}}const _e=hc;function Yc(e){return Kc(e)}function Kc(e,t){const n=Ur();n.__VUE__=!0;const{insert:r,remove:a,patchProp:i,createElement:o,createText:l,createComment:s,setText:f,setElementText:c,parentNode:d,nextSibling:p,setScopeId:g=Me,insertStaticContent:P}=e,C=(u,m,h,v=null,y=null,w=null,R=!1,k=null,A=!!m.dynamicChildren)=>{if(u===m)return;u&&!en(u,m)&&(v=b(u),ye(u,y,w,!0),u=null),m.patchFlag===-2&&(A=!1,m.dynamicChildren=null);const{type:E,ref:z,shapeFlag:N}=m;switch(E){case _r:F(u,m,h,v);break;case bn:x(u,m,h,v);break;case Gn:u==null&&_(m,h,v,R);break;case He:vt(u,m,h,v,y,w,R,k,A);break;default:N&1?U(u,m,h,v,y,w,R,k,A):N&6?je(u,m,h,v,y,w,R,k,A):(N&64||N&128)&&E.process(u,m,h,v,y,w,R,k,A,O)}z!=null&&y&&Zr(z,u&&u.ref,w,m||u,!m)},F=(u,m,h,v)=>{if(u==null)r(m.el=l(m.children),h,v);else{const y=m.el=u.el;m.children!==u.children&&f(y,m.children)}},x=(u,m,h,v)=>{u==null?r(m.el=s(m.children||""),h,v):m.el=u.el},_=(u,m,h,v)=>{[u.el,u.anchor]=P(u.children,m,h,v,u.el,u.anchor)},L=({el:u,anchor:m},h,v)=>{let y;for(;u&&u!==m;)y=p(u),r(u,h,v),u=y;r(m,h,v)},S=({el:u,anchor:m})=>{let h;for(;u&&u!==m;)h=p(u),a(u),u=h;a(m)},U=(u,m,h,v,y,w,R,k,A)=>{R=R||m.type==="svg",u==null?J(m,h,v,y,w,R,k,A):ve(u,m,y,w,R,k,A)},J=(u,m,h,v,y,w,R,k)=>{let A,E;const{type:z,props:N,shapeFlag:$,transition:D,dirs:W}=u;if(A=u.el=o(u.type,w,N&&N.is,N),$&8?c(A,u.children):$&16&&Ee(u.children,A,null,v,y,w&&z!=="foreignObject",R,k),W&&bt(u,null,v,"created"),re(A,u,u.scopeId,R,v),N){for(const G in N)G!=="value"&&!Kn(G)&&i(A,G,null,N[G],w,u.children,v,y,pe);"value"in N&&i(A,"value",null,N.value),(E=N.onVnodeBeforeMount)&&De(E,v,u)}W&&bt(u,null,v,"beforeMount");const Z=(!y||y&&!y.pendingBranch)&&D&&!D.persisted;Z&&D.beforeEnter(A),r(A,m,h),((E=N&&N.onVnodeMounted)||Z||W)&&_e(()=>{E&&De(E,v,u),Z&&D.enter(A),W&&bt(u,null,v,"mounted")},y)},re=(u,m,h,v,y)=>{if(h&&g(u,h),v)for(let w=0;w<v.length;w++)g(u,v[w]);if(y){let w=y.subTree;if(m===w){const R=y.vnode;re(u,R,R.scopeId,R.slotScopeIds,y.parent)}}},Ee=(u,m,h,v,y,w,R,k,A=0)=>{for(let E=A;E<u.length;E++){const z=u[E]=k?ct(u[E]):Be(u[E]);C(null,z,m,h,v,y,w,R,k)}},ve=(u,m,h,v,y,w,R)=>{const k=m.el=u.el;let{patchFlag:A,dynamicChildren:E,dirs:z}=m;A|=u.patchFlag&16;const N=u.props||ne,$=m.props||ne;let D;h&&yt(h,!1),(D=$.onVnodeBeforeUpdate)&&De(D,h,m,u),z&&bt(m,u,h,"beforeUpdate"),h&&yt(h,!0);const W=y&&m.type!=="foreignObject";if(E?Oe(u.dynamicChildren,E,k,h,v,W,w):R||q(u,m,k,null,h,v,W,w,!1),A>0){if(A&16)at(k,m,N,$,h,v,y);else if(A&2&&N.class!==$.class&&i(k,"class",null,$.class,y),A&4&&i(k,"style",N.style,$.style,y),A&8){const Z=m.dynamicProps;for(let G=0;G<Z.length;G++){const oe=Z[G],Pe=N[oe],It=$[oe];(It!==Pe||oe==="value")&&i(k,oe,Pe,It,y,u.children,h,v,pe)}}A&1&&u.children!==m.children&&c(k,m.children)}else!R&&E==null&&at(k,m,N,$,h,v,y);((D=$.onVnodeUpdated)||z)&&_e(()=>{D&&De(D,h,m,u),z&&bt(m,u,h,"updated")},v)},Oe=(u,m,h,v,y,w,R)=>{for(let k=0;k<m.length;k++){const A=u[k],E=m[k],z=A.el&&(A.type===He||!en(A,E)||A.shapeFlag&70)?d(A.el):h;C(A,E,z,null,v,y,w,R,!0)}},at=(u,m,h,v,y,w,R)=>{if(h!==v){if(h!==ne)for(const k in h)!Kn(k)&&!(k in v)&&i(u,k,h[k],null,R,m.children,y,w,pe);for(const k in v){if(Kn(k))continue;const A=v[k],E=h[k];A!==E&&k!=="value"&&i(u,k,E,A,R,m.children,y,w,pe)}"value"in v&&i(u,"value",h.value,v.value)}},vt=(u,m,h,v,y,w,R,k,A)=>{const E=m.el=u?u.el:l(""),z=m.anchor=u?u.anchor:l("");let{patchFlag:N,dynamicChildren:$,slotScopeIds:D}=m;D&&(k=k?k.concat(D):D),u==null?(r(E,h,v),r(z,h,v),Ee(m.children,h,z,y,w,R,k,A)):N>0&&N&64&&$&&u.dynamicChildren?(Oe(u.dynamicChildren,$,h,y,w,R,k),(m.key!=null||y&&m===y.subTree)&&vs(u,m,!0)):q(u,m,h,z,y,w,R,k,A)},je=(u,m,h,v,y,w,R,k,A)=>{m.slotScopeIds=k,u==null?m.shapeFlag&512?y.ctx.activate(m,h,v,R,A):Jt(m,h,v,y,w,R,A):Ct(u,m,A)},Jt=(u,m,h,v,y,w,R)=>{const k=u.component=nf(u,v,y);if(os(u)&&(k.ctx.renderer=O),rf(k),k.asyncDep){if(y&&y.registerDep(k,ce),!u.el){const A=k.subTree=se(bn);x(null,A,m,h)}return}ce(k,u,m,h,y,w,R)},Ct=(u,m,h)=>{const v=m.component=u.component;if(dc(u,m,h))if(v.asyncDep&&!v.asyncResolved){Q(v,m,h);return}else v.next=m,oc(v.update),v.update();else m.el=u.el,v.vnode=m},ce=(u,m,h,v,y,w,R)=>{const k=()=>{if(u.isMounted){let{next:z,bu:N,u:$,parent:D,vnode:W}=u,Z=z,G;yt(u,!1),z?(z.el=W.el,Q(u,z,R)):z=W,N&&Rr(N),(G=z.props&&z.props.onVnodeBeforeUpdate)&&De(G,D,z,W),yt(u,!0);const oe=Ir(u),Pe=u.subTree;u.subTree=oe,C(Pe,oe,d(Pe.el),b(Pe),u,y,w),z.el=oe.el,Z===null&&mc(u,oe.el),$&&_e($,y),(G=z.props&&z.props.onVnodeUpdated)&&_e(()=>De(G,D,z,W),y)}else{let z;const{el:N,props:$}=m,{bm:D,m:W,parent:Z}=u,G=Vn(m);if(yt(u,!1),D&&Rr(D),!G&&(z=$&&$.onVnodeBeforeMount)&&De(z,Z,m),yt(u,!0),N&&V){const oe=()=>{u.subTree=Ir(u),V(N,u.subTree,u,y,null)};G?m.type.__asyncLoader().then(()=>!u.isUnmounted&&oe()):oe()}else{const oe=u.subTree=Ir(u);C(null,oe,h,v,u,y,w),m.el=oe.el}if(W&&_e(W,y),!G&&(z=$&&$.onVnodeMounted)){const oe=m;_e(()=>De(z,Z,oe),y)}(m.shapeFlag&256||Z&&Vn(Z.vnode)&&Z.vnode.shapeFlag&256)&&u.a&&_e(u.a,y),u.isMounted=!0,m=h=v=null}},A=u.effect=new Aa(k,()=>Na(E),u.scope),E=u.update=()=>A.run();E.id=u.uid,yt(u,!0),E()},Q=(u,m,h)=>{m.component=u;const v=u.vnode.props;u.vnode=m,u.next=null,Hc(u,m.props,v,h),Wc(u,m.children,h),Vt(),hi(),Xt()},q=(u,m,h,v,y,w,R,k,A=!1)=>{const E=u&&u.children,z=u?u.shapeFlag:0,N=m.children,{patchFlag:$,shapeFlag:D}=m;if($>0){if($&128){it(E,N,h,v,y,w,R,k,A);return}else if($&256){Ke(E,N,h,v,y,w,R,k,A);return}}D&8?(z&16&&pe(E,y,w),N!==E&&c(h,N)):z&16?D&16?it(E,N,h,v,y,w,R,k,A):pe(E,y,w,!0):(z&8&&c(h,""),D&16&&Ee(N,h,v,y,w,R,k,A))},Ke=(u,m,h,v,y,w,R,k,A)=>{u=u||jt,m=m||jt;const E=u.length,z=m.length,N=Math.min(E,z);let $;for($=0;$<N;$++){const D=m[$]=A?ct(m[$]):Be(m[$]);C(u[$],D,h,null,y,w,R,k,A)}E>z?pe(u,y,w,!0,!1,N):Ee(m,h,v,y,w,R,k,A,N)},it=(u,m,h,v,y,w,R,k,A)=>{let E=0;const z=m.length;let N=u.length-1,$=z-1;for(;E<=N&&E<=$;){const D=u[E],W=m[E]=A?ct(m[E]):Be(m[E]);if(en(D,W))C(D,W,h,null,y,w,R,k,A);else break;E++}for(;E<=N&&E<=$;){const D=u[N],W=m[$]=A?ct(m[$]):Be(m[$]);if(en(D,W))C(D,W,h,null,y,w,R,k,A);else break;N--,$--}if(E>N){if(E<=$){const D=$+1,W=D<z?m[D].el:v;for(;E<=$;)C(null,m[E]=A?ct(m[E]):Be(m[E]),h,W,y,w,R,k,A),E++}}else if(E>$)for(;E<=N;)ye(u[E],y,w,!0),E++;else{const D=E,W=E,Z=new Map;for(E=W;E<=$;E++){const ke=m[E]=A?ct(m[E]):Be(m[E]);ke.key!=null&&Z.set(ke.key,E)}let G,oe=0;const Pe=$-W+1;let It=!1,ai=0;const Zt=new Array(Pe);for(E=0;E<Pe;E++)Zt[E]=0;for(E=D;E<=N;E++){const ke=u[E];if(oe>=Pe){ye(ke,y,w,!0);continue}let $e;if(ke.key!=null)$e=Z.get(ke.key);else for(G=W;G<=$;G++)if(Zt[G-W]===0&&en(ke,m[G])){$e=G;break}$e===void 0?ye(ke,y,w,!0):(Zt[$e-W]=E+1,$e>=ai?ai=$e:It=!0,C(ke,m[$e],h,null,y,w,R,k,A),oe++)}const ii=It?qc(Zt):jt;for(G=ii.length-1,E=Pe-1;E>=0;E--){const ke=W+E,$e=m[ke],oi=ke+1<z?m[ke+1].el:v;Zt[E]===0?C(null,$e,h,oi,y,w,R,k,A):It&&(G<0||E!==ii[G]?ze($e,h,oi,2):G--)}}},ze=(u,m,h,v,y=null)=>{const{el:w,type:R,transition:k,children:A,shapeFlag:E}=u;if(E&6){ze(u.component.subTree,m,h,v);return}if(E&128){u.suspense.move(m,h,v);return}if(E&64){R.move(u,m,h,O);return}if(R===He){r(w,m,h);for(let N=0;N<A.length;N++)ze(A[N],m,h,v);r(u.anchor,m,h);return}if(R===Gn){L(u,m,h);return}if(v!==2&&E&1&&k)if(v===0)k.beforeEnter(w),r(w,m,h),_e(()=>k.enter(w),y);else{const{leave:N,delayLeave:$,afterLeave:D}=k,W=()=>r(w,m,h),Z=()=>{N(w,()=>{W(),D&&D()})};$?$(w,W,Z):Z()}else r(w,m,h)},ye=(u,m,h,v=!1,y=!1)=>{const{type:w,props:R,ref:k,children:A,dynamicChildren:E,shapeFlag:z,patchFlag:N,dirs:$}=u;if(k!=null&&Zr(k,null,h,u,!0),z&256){m.ctx.deactivate(u);return}const D=z&1&&$,W=!Vn(u);let Z;if(W&&(Z=R&&R.onVnodeBeforeUnmount)&&De(Z,m,u),z&6)Rn(u.component,h,v);else{if(z&128){u.suspense.unmount(h,v);return}D&&bt(u,null,m,"beforeUnmount"),z&64?u.type.remove(u,m,h,y,O,v):E&&(w!==He||N>0&&N&64)?pe(E,m,h,!1,!0):(w===He&&N&384||!y&&z&16)&&pe(A,m,h),v&&St(u)}(W&&(Z=R&&R.onVnodeUnmounted)||D)&&_e(()=>{Z&&De(Z,m,u),D&&bt(u,null,m,"unmounted")},h)},St=u=>{const{type:m,el:h,anchor:v,transition:y}=u;if(m===He){Rt(h,v);return}if(m===Gn){S(u);return}const w=()=>{a(h),y&&!y.persisted&&y.afterLeave&&y.afterLeave()};if(u.shapeFlag&1&&y&&!y.persisted){const{leave:R,delayLeave:k}=y,A=()=>R(h,w);k?k(u.el,w,A):A()}else w()},Rt=(u,m)=>{let h;for(;u!==m;)h=p(u),a(u),u=h;a(m)},Rn=(u,m,h)=>{const{bum:v,scope:y,update:w,subTree:R,um:k}=u;v&&Rr(v),y.stop(),w&&(w.active=!1,ye(R,u,m,h)),k&&_e(k,m),_e(()=>{u.isUnmounted=!0},m),m&&m.pendingBranch&&!m.isUnmounted&&u.asyncDep&&!u.asyncResolved&&u.suspenseId===m.pendingId&&(m.deps--,m.deps===0&&m.resolve())},pe=(u,m,h,v=!1,y=!1,w=0)=>{for(let R=w;R<u.length;R++)ye(u[R],m,h,v,y)},b=u=>u.shapeFlag&6?b(u.component.subTree):u.shapeFlag&128?u.suspense.next():p(u.anchor||u.el),T=(u,m,h)=>{u==null?m._vnode&&ye(m._vnode,null,null,!0):C(m._vnode||null,u,m,null,null,null,h),hi(),es(),m._vnode=u},O={p:C,um:ye,m:ze,r:St,mt:Jt,mc:Ee,pc:q,pbc:Oe,n:b,o:e};let j,V;return t&&([j,V]=t(O)),{render:T,hydrate:j,createApp:$c(T,j)}}function yt({effect:e,update:t},n){e.allowRecurse=t.allowRecurse=n}function vs(e,t,n=!1){const r=e.children,a=t.children;if(H(r)&&H(a))for(let i=0;i<r.length;i++){const o=r[i];let l=a[i];l.shapeFlag&1&&!l.dynamicChildren&&((l.patchFlag<=0||l.patchFlag===32)&&(l=a[i]=ct(a[i]),l.el=o.el),n||vs(o,l)),l.type===_r&&(l.el=o.el)}}function qc(e){const t=e.slice(),n=[0];let r,a,i,o,l;const s=e.length;for(r=0;r<s;r++){const f=e[r];if(f!==0){if(a=n[n.length-1],e[a]<f){t[r]=a,n.push(r);continue}for(i=0,o=n.length-1;i<o;)l=i+o>>1,e[n[l]]<f?i=l+1:o=l;f<e[n[i]]&&(i>0&&(t[r]=n[i-1]),n[i]=r)}}for(i=n.length,o=n[i-1];i-- >0;)n[i]=o,o=t[o];return n}const Vc=e=>e.__isTeleport,He=Symbol.for("v-fgt"),_r=Symbol.for("v-txt"),bn=Symbol.for("v-cmt"),Gn=Symbol.for("v-stc"),cn=[];let Te=null;function Fa(e=!1){cn.push(Te=e?null:[])}function Xc(){cn.pop(),Te=cn[cn.length-1]||null}let yn=1;function Oi(e){yn+=e}function Gc(e){return e.dynamicChildren=yn>0?Te||jt:null,Xc(),yn>0&&Te&&Te.push(e),e}function ja(e,t,n,r,a,i){return Gc(Se(e,t,n,r,a,i,!0))}function ea(e){return e?e.__v_isVNode===!0:!1}function en(e,t){return e.type===t.type&&e.key===t.key}const wr="__vInternal",bs=({key:e})=>e??null,Qn=({ref:e,ref_key:t,ref_for:n})=>(typeof e=="number"&&(e=""+e),e!=null?me(e)||ge(e)||B(e)?{i:Ie,r:e,k:t,f:!!n}:e:null);function Se(e,t=null,n=null,r=0,a=null,i=e===He?0:1,o=!1,l=!1){const s={__v_isVNode:!0,__v_skip:!0,type:e,props:t,key:t&&bs(t),ref:t&&Qn(t),scopeId:rs,slotScopeIds:null,children:n,component:null,suspense:null,ssContent:null,ssFallback:null,dirs:null,transition:null,el:null,anchor:null,target:null,targetAnchor:null,staticCount:0,shapeFlag:i,patchFlag:r,dynamicProps:a,dynamicChildren:null,appContext:null,ctx:Ie};return l?(za(s,n),i&128&&e.normalize(s)):n&&(s.shapeFlag|=me(n)?8:16),yn>0&&!o&&Te&&(s.patchFlag>0||i&6)&&s.patchFlag!==32&&Te.push(s),s}const se=Qc;function Qc(e,t=null,n=null,r=0,a=null,i=!1){if((!e||e===Rc)&&(e=bn),ea(e)){const l=Bt(e,t,!0);return n&&za(l,n),yn>0&&!i&&Te&&(l.shapeFlag&6?Te[Te.indexOf(e)]=l:Te.push(l)),l.patchFlag|=-2,l}if(cf(e)&&(e=e.__vccOpts),t){t=Jc(t);let{class:l,style:s}=t;l&&!me(l)&&(t.class=Ea(l)),ie(s)&&(Yo(s)&&!H(s)&&(s=fe({},s)),t.style=wa(s))}const o=me(e)?1:pc(e)?128:Vc(e)?64:ie(e)?4:B(e)?2:0;return Se(e,t,n,r,a,o,i,!0)}function Jc(e){return e?Yo(e)||wr in e?fe({},e):e:null}function Bt(e,t,n=!1){const{props:r,ref:a,patchFlag:i,children:o}=e,l=t?Zc(r||{},t):r;return{__v_isVNode:!0,__v_skip:!0,type:e.type,props:l,key:l&&bs(l),ref:t&&t.ref?n&&a?H(a)?a.concat(Qn(t)):[a,Qn(t)]:Qn(t):a,scopeId:e.scopeId,slotScopeIds:e.slotScopeIds,children:o,target:e.target,targetAnchor:e.targetAnchor,staticCount:e.staticCount,shapeFlag:e.shapeFlag,patchFlag:t&&e.type!==He?i===-1?16:i|16:i,dynamicProps:e.dynamicProps,dynamicChildren:e.dynamicChildren,appContext:e.appContext,dirs:e.dirs,transition:e.transition,component:e.component,suspense:e.suspense,ssContent:e.ssContent&&Bt(e.ssContent),ssFallback:e.ssFallback&&Bt(e.ssFallback),el:e.el,anchor:e.anchor,ctx:e.ctx,ce:e.ce}}function Jn(e=" ",t=0){return se(_r,null,e,t)}function lp(e,t){const n=se(Gn,null,e);return n.staticCount=t,n}function Be(e){return e==null||typeof e=="boolean"?se(bn):H(e)?se(He,null,e.slice()):typeof e=="object"?ct(e):se(_r,null,String(e))}function ct(e){return e.el===null&&e.patchFlag!==-1||e.memo?e:Bt(e)}function za(e,t){let n=0;const{shapeFlag:r}=e;if(t==null)t=null;else if(H(t))n=16;else if(typeof t=="object")if(r&65){const a=t.default;a&&(a._c&&(a._d=!1),za(e,a()),a._c&&(a._d=!0));return}else{n=32;const a=t._;!a&&!(wr in t)?t._ctx=Ie:a===3&&Ie&&(Ie.slots._===1?t._=1:(t._=2,e.patchFlag|=1024))}else B(t)?(t={default:t,_ctx:Ie},n=32):(t=String(t),r&64?(n=16,t=[Jn(t)]):n=8);e.children=t,e.shapeFlag|=n}function Zc(...e){const t={};for(let n=0;n<e.length;n++){const r=e[n];for(const a in r)if(a==="class")t.class!==r.class&&(t.class=Ea([t.class,r.class]));else if(a==="style")t.style=wa([t.style,r.style]);else if(dr(a)){const i=t[a],o=r[a];o&&i!==o&&!(H(i)&&i.includes(o))&&(t[a]=i?[].concat(i,o):o)}else a!==""&&(t[a]=r[a])}return t}function De(e,t,n,r=null){Le(e,t,7,[n,r])}const ef=us();let tf=0;function nf(e,t,n){const r=e.type,a=(t?t.appContext:e.appContext)||ef,i={uid:tf++,vnode:e,type:r,parent:t,appContext:a,root:null,next:null,subTree:null,effect:null,update:null,scope:new To(!0),render:null,proxy:null,exposed:null,exposeProxy:null,withProxy:null,provides:t?t.provides:Object.create(a.provides),accessCache:null,renderCache:[],components:null,directives:null,propsOptions:ms(r,a),emitsOptions:ns(r,a),emit:null,emitted:null,propsDefaults:ne,inheritAttrs:r.inheritAttrs,ctx:ne,data:ne,props:ne,attrs:ne,slots:ne,refs:ne,setupState:ne,setupContext:null,attrsProxy:null,slotsProxy:null,suspense:n,suspenseId:n?n.pendingId:0,asyncDep:null,asyncResolved:!1,isMounted:!1,isUnmounted:!1,isDeactivated:!1,bc:null,c:null,bm:null,m:null,bu:null,u:null,um:null,bum:null,da:null,a:null,rtg:null,rtc:null,ec:null,sp:null};return i.ctx={_:i},i.root=t?t.root:i,i.emit=cc.bind(null,i),e.ce&&e.ce(i),i}let de=null,$a,Tt,Pi="__VUE_INSTANCE_SETTERS__";(Tt=Ur()[Pi])||(Tt=Ur()[Pi]=[]),Tt.push(e=>de=e),$a=e=>{Tt.length>1?Tt.forEach(t=>t(e)):Tt[0](e)};const Ut=e=>{$a(e),e.scope.on()},At=()=>{de&&de.scope.off(),$a(null)};function ys(e){return e.vnode.shapeFlag&4}let xn=!1;function rf(e,t=!1){xn=t;const{props:n,children:r}=e.vnode,a=ys(e);Dc(e,n,a,t),Uc(e,r);const i=a?af(e,t):void 0;return xn=!1,i}function af(e,t){const n=e.type;e.accessCache=Object.create(null),e.proxy=Ra(new Proxy(e.ctx,Tc));const{setup:r}=n;if(r){const a=e.setupContext=r.length>1?sf(e):null;Ut(e),Vt();const i=dt(r,e,0,[e.props,a]);if(Xt(),At(),Ro(i)){if(i.then(At,At),t)return i.then(o=>{Ci(e,o,t)}).catch(o=>{br(o,e,0)});e.asyncDep=i}else Ci(e,i,t)}else xs(e,t)}function Ci(e,t,n){B(t)?e.type.__ssrInlineRender?e.ssrRender=t:e.render=t:ie(t)&&(e.setupState=Go(t)),xs(e,n)}let Si;function xs(e,t,n){const r=e.type;if(!e.render){if(!t&&Si&&!r.render){const a=r.template||Ma(e).template;if(a){const{isCustomElement:i,compilerOptions:o}=e.appContext.config,{delimiters:l,compilerOptions:s}=r,f=fe(fe({isCustomElement:i,delimiters:l},o),s);r.render=Si(a,f)}}e.render=r.render||Me}Ut(e),Vt(),Nc(e),Xt(),At()}function of(e){return e.attrsProxy||(e.attrsProxy=new Proxy(e.attrs,{get(t,n){return we(e,"get","$attrs"),t[n]}}))}function sf(e){const t=n=>{e.exposed=n||{}};return{get attrs(){return of(e)},slots:e.slots,emit:e.emit,expose:t}}function Da(e){if(e.exposed)return e.exposeProxy||(e.exposeProxy=new Proxy(Go(Ra(e.exposed)),{get(t,n){if(n in t)return t[n];if(n in ln)return ln[n](e)},has(t,n){return n in t||n in ln}}))}function lf(e,t=!0){return B(e)?e.displayName||e.name:e.name||t&&e.__name}function cf(e){return B(e)&&"__vccOpts"in e}const ue=(e,t)=>rc(e,t,xn);function Ha(e,t,n){const r=arguments.length;return r===2?ie(t)&&!H(t)?ea(t)?se(e,null,[t]):se(e,t):se(e,null,t):(r>3?n=Array.prototype.slice.call(arguments,2):r===3&&ea(n)&&(n=[n]),se(e,t,n))}const ff=Symbol.for("v-scx"),uf=()=>Qe(ff),df="3.3.4",mf="http://www.w3.org/2000/svg",_t=typeof document<"u"?document:null,Ri=_t&&_t.createElement("template"),pf={insert:(e,t,n)=>{t.insertBefore(e,n||null)},remove:e=>{const t=e.parentNode;t&&t.removeChild(e)},createElement:(e,t,n,r)=>{const a=t?_t.createElementNS(mf,e):_t.createElement(e,n?{is:n}:void 0);return e==="select"&&r&&r.multiple!=null&&a.setAttribute("multiple",r.multiple),a},createText:e=>_t.createTextNode(e),createComment:e=>_t.createComment(e),setText:(e,t)=>{e.nodeValue=t},setElementText:(e,t)=>{e.textContent=t},parentNode:e=>e.parentNode,nextSibling:e=>e.nextSibling,querySelector:e=>_t.querySelector(e),setScopeId(e,t){e.setAttribute(t,"")},insertStaticContent(e,t,n,r,a,i){const o=n?n.previousSibling:t.lastChild;if(a&&(a===i||a.nextSibling))for(;t.insertBefore(a.cloneNode(!0),n),!(a===i||!(a=a.nextSibling)););else{Ri.innerHTML=r?`<svg>${e}</svg>`:e;const l=Ri.content;if(r){const s=l.firstChild;for(;s.firstChild;)l.appendChild(s.firstChild);l.removeChild(s)}t.insertBefore(l,n)}return[o?o.nextSibling:t.firstChild,n?n.previousSibling:t.lastChild]}};function hf(e,t,n){const r=e._vtc;r&&(t=(t?[t,...r]:[...r]).join(" ")),t==null?e.removeAttribute("class"):n?e.setAttribute("class",t):e.className=t}function gf(e,t,n){const r=e.style,a=me(n);if(n&&!a){if(t&&!me(t))for(const i in t)n[i]==null&&ta(r,i,"");for(const i in n)ta(r,i,n[i])}else{const i=r.display;a?t!==n&&(r.cssText=n):t&&e.removeAttribute("style"),"_vod"in e&&(r.display=i)}}const Ii=/\s*!important$/;function ta(e,t,n){if(H(n))n.forEach(r=>ta(e,t,r));else if(n==null&&(n=""),t.startsWith("--"))e.setProperty(t,n);else{const r=vf(e,t);Ii.test(n)?e.setProperty(qt(r),n.replace(Ii,""),"important"):e[r]=n}}const Ti=["Webkit","Moz","ms"],Nr={};function vf(e,t){const n=Nr[t];if(n)return n;let r=Ye(t);if(r!=="filter"&&r in e)return Nr[t]=r;r=hr(r);for(let a=0;a<Ti.length;a++){const i=Ti[a]+r;if(i in e)return Nr[t]=i}return t}const Ni="http://www.w3.org/1999/xlink";function bf(e,t,n,r,a){if(r&&t.startsWith("xlink:"))n==null?e.removeAttributeNS(Ni,t.slice(6,t.length)):e.setAttributeNS(Ni,t,n);else{const i=El(t);n==null||i&&!Io(n)?e.removeAttribute(t):e.setAttribute(t,i?"":n)}}function yf(e,t,n,r,a,i,o){if(t==="innerHTML"||t==="textContent"){r&&o(r,a,i),e[t]=n??"";return}const l=e.tagName;if(t==="value"&&l!=="PROGRESS"&&!l.includes("-")){e._value=n;const f=l==="OPTION"?e.getAttribute("value"):e.value,c=n??"";f!==c&&(e.value=c),n==null&&e.removeAttribute(t);return}let s=!1;if(n===""||n==null){const f=typeof e[t];f==="boolean"?n=Io(n):n==null&&f==="string"?(n="",s=!0):f==="number"&&(n=0,s=!0)}try{e[t]=n}catch{}s&&e.removeAttribute(t)}function xf(e,t,n,r){e.addEventListener(t,n,r)}function _f(e,t,n,r){e.removeEventListener(t,n,r)}function wf(e,t,n,r,a=null){const i=e._vei||(e._vei={}),o=i[t];if(r&&o)o.value=r;else{const[l,s]=Ef(t);if(r){const f=i[t]=Of(r,a);xf(e,l,f,s)}else o&&(_f(e,l,o,s),i[t]=void 0)}}const Mi=/(?:Once|Passive|Capture)$/;function Ef(e){let t;if(Mi.test(e)){t={};let r;for(;r=e.match(Mi);)e=e.slice(0,e.length-r[0].length),t[r[0].toLowerCase()]=!0}return[e[2]===":"?e.slice(3):qt(e.slice(2)),t]}let Mr=0;const kf=Promise.resolve(),Af=()=>Mr||(kf.then(()=>Mr=0),Mr=Date.now());function Of(e,t){const n=r=>{if(!r._vts)r._vts=Date.now();else if(r._vts<=n.attached)return;Le(Pf(r,n.value),t,5,[r])};return n.value=e,n.attached=Af(),n}function Pf(e,t){if(H(t)){const n=e.stopImmediatePropagation;return e.stopImmediatePropagation=()=>{n.call(e),e._stopped=!0},t.map(r=>a=>!a._stopped&&r&&r(a))}else return t}const Li=/^on[a-z]/,Cf=(e,t,n,r,a=!1,i,o,l,s)=>{t==="class"?hf(e,r,a):t==="style"?gf(e,n,r):dr(t)?ba(t)||wf(e,t,n,r,o):(t[0]==="."?(t=t.slice(1),!0):t[0]==="^"?(t=t.slice(1),!1):Sf(e,t,r,a))?yf(e,t,r,i,o,l,s):(t==="true-value"?e._trueValue=r:t==="false-value"&&(e._falseValue=r),bf(e,t,r,a))};function Sf(e,t,n,r){return r?!!(t==="innerHTML"||t==="textContent"||t in e&&Li.test(t)&&B(n)):t==="spellcheck"||t==="draggable"||t==="translate"||t==="form"||t==="list"&&e.tagName==="INPUT"||t==="type"&&e.tagName==="TEXTAREA"||Li.test(t)&&me(n)?!1:t in e}const Rf=fe({patchProp:Cf},pf);let Fi;function If(){return Fi||(Fi=Yc(Rf))}const Tf=(...e)=>{const t=If().createApp(...e),{mount:n}=t;return t.mount=r=>{const a=Nf(r);if(!a)return;const i=t._component;!B(i)&&!i.render&&!i.template&&(i.template=a.innerHTML),a.innerHTML="";const o=n(a,!1,a instanceof SVGElement);return a instanceof Element&&(a.removeAttribute("v-cloak"),a.setAttribute("data-v-app","")),o},t};function Nf(e){return me(e)?document.querySelector(e):e}const Mf="modulepreload",Lf=function(e,t){return new URL(e,t).href},ji={},zi=function(t,n,r){if(!n||n.length===0)return t();const a=document.getElementsByTagName("link");return Promise.all(n.map(i=>{if(i=Lf(i,r),i in ji)return;ji[i]=!0;const o=i.endsWith(".css"),l=o?'[rel="stylesheet"]':"";if(!!r)for(let c=a.length-1;c>=0;c--){const d=a[c];if(d.href===i&&(!o||d.rel==="stylesheet"))return}else if(document.querySelector(`link[href="${i}"]${l}`))return;const f=document.createElement("link");if(f.rel=o?"stylesheet":Mf,o||(f.as="script",f.crossOrigin=""),f.href=i,document.head.appendChild(f),o)return new Promise((c,d)=>{f.addEventListener("load",c),f.addEventListener("error",()=>d(new Error(`Unable to preload CSS for ${i}`)))})})).then(()=>t()).catch(i=>{const o=new Event("vite:preloadError",{cancelable:!0});if(o.payload=i,window.dispatchEvent(o),!o.defaultPrevented)throw i})};/*!
  * vue-router v4.2.4
  * (c) 2023 Eduardo San Martin Morote
  * @license MIT
  */const Nt=typeof window<"u";function Ff(e){return e.__esModule||e[Symbol.toStringTag]==="Module"}const X=Object.assign;function Lr(e,t){const n={};for(const r in t){const a=t[r];n[r]=Fe(a)?a.map(e):e(a)}return n}const fn=()=>{},Fe=Array.isArray,jf=/\/$/,zf=e=>e.replace(jf,"");function Fr(e,t,n="/"){let r,a={},i="",o="";const l=t.indexOf("#");let s=t.indexOf("?");return l<s&&l>=0&&(s=-1),s>-1&&(r=t.slice(0,s),i=t.slice(s+1,l>-1?l:t.length),a=e(i)),l>-1&&(r=r||t.slice(0,l),o=t.slice(l,t.length)),r=Bf(r??t,n),{fullPath:r+(i&&"?")+i+o,path:r,query:a,hash:o}}function $f(e,t){const n=t.query?e(t.query):"";return t.path+(n&&"?")+n+(t.hash||"")}function $i(e,t){return!t||!e.toLowerCase().startsWith(t.toLowerCase())?e:e.slice(t.length)||"/"}function Df(e,t,n){const r=t.matched.length-1,a=n.matched.length-1;return r>-1&&r===a&&Wt(t.matched[r],n.matched[a])&&_s(t.params,n.params)&&e(t.query)===e(n.query)&&t.hash===n.hash}function Wt(e,t){return(e.aliasOf||e)===(t.aliasOf||t)}function _s(e,t){if(Object.keys(e).length!==Object.keys(t).length)return!1;for(const n in e)if(!Hf(e[n],t[n]))return!1;return!0}function Hf(e,t){return Fe(e)?Di(e,t):Fe(t)?Di(t,e):e===t}function Di(e,t){return Fe(t)?e.length===t.length&&e.every((n,r)=>n===t[r]):e.length===1&&e[0]===t}function Bf(e,t){if(e.startsWith("/"))return e;if(!e)return t;const n=t.split("/"),r=e.split("/"),a=r[r.length-1];(a===".."||a===".")&&r.push("");let i=n.length-1,o,l;for(o=0;o<r.length;o++)if(l=r[o],l!==".")if(l==="..")i>1&&i--;else break;return n.slice(0,i).join("/")+"/"+r.slice(o-(o===r.length?1:0)).join("/")}var _n;(function(e){e.pop="pop",e.push="push"})(_n||(_n={}));var un;(function(e){e.back="back",e.forward="forward",e.unknown=""})(un||(un={}));function Uf(e){if(!e)if(Nt){const t=document.querySelector("base");e=t&&t.getAttribute("href")||"/",e=e.replace(/^\w+:\/\/[^\/]+/,"")}else e="/";return e[0]!=="/"&&e[0]!=="#"&&(e="/"+e),zf(e)}const Wf=/^[^#]+#/;function Yf(e,t){return e.replace(Wf,"#")+t}function Kf(e,t){const n=document.documentElement.getBoundingClientRect(),r=e.getBoundingClientRect();return{behavior:t.behavior,left:r.left-n.left-(t.left||0),top:r.top-n.top-(t.top||0)}}const Er=()=>({left:window.pageXOffset,top:window.pageYOffset});function qf(e){let t;if("el"in e){const n=e.el,r=typeof n=="string"&&n.startsWith("#"),a=typeof n=="string"?r?document.getElementById(n.slice(1)):document.querySelector(n):n;if(!a)return;t=Kf(a,e)}else t=e;"scrollBehavior"in document.documentElement.style?window.scrollTo(t):window.scrollTo(t.left!=null?t.left:window.pageXOffset,t.top!=null?t.top:window.pageYOffset)}function Hi(e,t){return(history.state?history.state.position-t:-1)+e}const na=new Map;function Vf(e,t){na.set(e,t)}function Xf(e){const t=na.get(e);return na.delete(e),t}let Gf=()=>location.protocol+"//"+location.host;function ws(e,t){const{pathname:n,search:r,hash:a}=t,i=e.indexOf("#");if(i>-1){let l=a.includes(e.slice(i))?e.slice(i).length:1,s=a.slice(l);return s[0]!=="/"&&(s="/"+s),$i(s,"")}return $i(n,e)+r+a}function Qf(e,t,n,r){let a=[],i=[],o=null;const l=({state:p})=>{const g=ws(e,location),P=n.value,C=t.value;let F=0;if(p){if(n.value=g,t.value=p,o&&o===P){o=null;return}F=C?p.position-C.position:0}else r(g);a.forEach(x=>{x(n.value,P,{delta:F,type:_n.pop,direction:F?F>0?un.forward:un.back:un.unknown})})};function s(){o=n.value}function f(p){a.push(p);const g=()=>{const P=a.indexOf(p);P>-1&&a.splice(P,1)};return i.push(g),g}function c(){const{history:p}=window;p.state&&p.replaceState(X({},p.state,{scroll:Er()}),"")}function d(){for(const p of i)p();i=[],window.removeEventListener("popstate",l),window.removeEventListener("beforeunload",c)}return window.addEventListener("popstate",l),window.addEventListener("beforeunload",c,{passive:!0}),{pauseListeners:s,listen:f,destroy:d}}function Bi(e,t,n,r=!1,a=!1){return{back:e,current:t,forward:n,replaced:r,position:window.history.length,scroll:a?Er():null}}function Jf(e){const{history:t,location:n}=window,r={value:ws(e,n)},a={value:t.state};a.value||i(r.value,{back:null,current:r.value,forward:null,position:t.length-1,replaced:!0,scroll:null},!0);function i(s,f,c){const d=e.indexOf("#"),p=d>-1?(n.host&&document.querySelector("base")?e:e.slice(d))+s:Gf()+e+s;try{t[c?"replaceState":"pushState"](f,"",p),a.value=f}catch(g){console.error(g),n[c?"replace":"assign"](p)}}function o(s,f){const c=X({},t.state,Bi(a.value.back,s,a.value.forward,!0),f,{position:a.value.position});i(s,c,!0),r.value=s}function l(s,f){const c=X({},a.value,t.state,{forward:s,scroll:Er()});i(c.current,c,!0);const d=X({},Bi(r.value,s,null),{position:c.position+1},f);i(s,d,!1),r.value=s}return{location:r,state:a,push:l,replace:o}}function Zf(e){e=Uf(e);const t=Jf(e),n=Qf(e,t.state,t.location,t.replace);function r(i,o=!0){o||n.pauseListeners(),history.go(i)}const a=X({location:"",base:e,go:r,createHref:Yf.bind(null,e)},t,n);return Object.defineProperty(a,"location",{enumerable:!0,get:()=>t.location.value}),Object.defineProperty(a,"state",{enumerable:!0,get:()=>t.state.value}),a}function eu(e){return typeof e=="string"||e&&typeof e=="object"}function Es(e){return typeof e=="string"||typeof e=="symbol"}const st={path:"/",name:void 0,params:{},query:{},hash:"",fullPath:"/",matched:[],meta:{},redirectedFrom:void 0},ks=Symbol("");var Ui;(function(e){e[e.aborted=4]="aborted",e[e.cancelled=8]="cancelled",e[e.duplicated=16]="duplicated"})(Ui||(Ui={}));function Yt(e,t){return X(new Error,{type:e,[ks]:!0},t)}function qe(e,t){return e instanceof Error&&ks in e&&(t==null||!!(e.type&t))}const Wi="[^/]+?",tu={sensitive:!1,strict:!1,start:!0,end:!0},nu=/[.+*?^${}()[\]/\\]/g;function ru(e,t){const n=X({},tu,t),r=[];let a=n.start?"^":"";const i=[];for(const f of e){const c=f.length?[]:[90];n.strict&&!f.length&&(a+="/");for(let d=0;d<f.length;d++){const p=f[d];let g=40+(n.sensitive?.25:0);if(p.type===0)d||(a+="/"),a+=p.value.replace(nu,"\\$&"),g+=40;else if(p.type===1){const{value:P,repeatable:C,optional:F,regexp:x}=p;i.push({name:P,repeatable:C,optional:F});const _=x||Wi;if(_!==Wi){g+=10;try{new RegExp(`(${_})`)}catch(S){throw new Error(`Invalid custom RegExp for param "${P}" (${_}): `+S.message)}}let L=C?`((?:${_})(?:/(?:${_}))*)`:`(${_})`;d||(L=F&&f.length<2?`(?:/${L})`:"/"+L),F&&(L+="?"),a+=L,g+=20,F&&(g+=-8),C&&(g+=-20),_===".*"&&(g+=-50)}c.push(g)}r.push(c)}if(n.strict&&n.end){const f=r.length-1;r[f][r[f].length-1]+=.7000000000000001}n.strict||(a+="/?"),n.end?a+="$":n.strict&&(a+="(?:/|$)");const o=new RegExp(a,n.sensitive?"":"i");function l(f){const c=f.match(o),d={};if(!c)return null;for(let p=1;p<c.length;p++){const g=c[p]||"",P=i[p-1];d[P.name]=g&&P.repeatable?g.split("/"):g}return d}function s(f){let c="",d=!1;for(const p of e){(!d||!c.endsWith("/"))&&(c+="/"),d=!1;for(const g of p)if(g.type===0)c+=g.value;else if(g.type===1){const{value:P,repeatable:C,optional:F}=g,x=P in f?f[P]:"";if(Fe(x)&&!C)throw new Error(`Provided param "${P}" is an array but it is not repeatable (* or + modifiers)`);const _=Fe(x)?x.join("/"):x;if(!_)if(F)p.length<2&&(c.endsWith("/")?c=c.slice(0,-1):d=!0);else throw new Error(`Missing required param "${P}"`);c+=_}}return c||"/"}return{re:o,score:r,keys:i,parse:l,stringify:s}}function au(e,t){let n=0;for(;n<e.length&&n<t.length;){const r=t[n]-e[n];if(r)return r;n++}return e.length<t.length?e.length===1&&e[0]===40+40?-1:1:e.length>t.length?t.length===1&&t[0]===40+40?1:-1:0}function iu(e,t){let n=0;const r=e.score,a=t.score;for(;n<r.length&&n<a.length;){const i=au(r[n],a[n]);if(i)return i;n++}if(Math.abs(a.length-r.length)===1){if(Yi(r))return 1;if(Yi(a))return-1}return a.length-r.length}function Yi(e){const t=e[e.length-1];return e.length>0&&t[t.length-1]<0}const ou={type:0,value:""},su=/[a-zA-Z0-9_]/;function lu(e){if(!e)return[[]];if(e==="/")return[[ou]];if(!e.startsWith("/"))throw new Error(`Invalid path "${e}"`);function t(g){throw new Error(`ERR (${n})/"${f}": ${g}`)}let n=0,r=n;const a=[];let i;function o(){i&&a.push(i),i=[]}let l=0,s,f="",c="";function d(){f&&(n===0?i.push({type:0,value:f}):n===1||n===2||n===3?(i.length>1&&(s==="*"||s==="+")&&t(`A repeatable param (${f}) must be alone in its segment. eg: '/:ids+.`),i.push({type:1,value:f,regexp:c,repeatable:s==="*"||s==="+",optional:s==="*"||s==="?"})):t("Invalid state to consume buffer"),f="")}function p(){f+=s}for(;l<e.length;){if(s=e[l++],s==="\\"&&n!==2){r=n,n=4;continue}switch(n){case 0:s==="/"?(f&&d(),o()):s===":"?(d(),n=1):p();break;case 4:p(),n=r;break;case 1:s==="("?n=2:su.test(s)?p():(d(),n=0,s!=="*"&&s!=="?"&&s!=="+"&&l--);break;case 2:s===")"?c[c.length-1]=="\\"?c=c.slice(0,-1)+s:n=3:c+=s;break;case 3:d(),n=0,s!=="*"&&s!=="?"&&s!=="+"&&l--,c="";break;default:t("Unknown state");break}}return n===2&&t(`Unfinished custom RegExp for param "${f}"`),d(),o(),a}function cu(e,t,n){const r=ru(lu(e.path),n),a=X(r,{record:e,parent:t,children:[],alias:[]});return t&&!a.record.aliasOf==!t.record.aliasOf&&t.children.push(a),a}function fu(e,t){const n=[],r=new Map;t=Vi({strict:!1,end:!0,sensitive:!1},t);function a(c){return r.get(c)}function i(c,d,p){const g=!p,P=uu(c);P.aliasOf=p&&p.record;const C=Vi(t,c),F=[P];if("alias"in c){const L=typeof c.alias=="string"?[c.alias]:c.alias;for(const S of L)F.push(X({},P,{components:p?p.record.components:P.components,path:S,aliasOf:p?p.record:P}))}let x,_;for(const L of F){const{path:S}=L;if(d&&S[0]!=="/"){const U=d.record.path,J=U[U.length-1]==="/"?"":"/";L.path=d.record.path+(S&&J+S)}if(x=cu(L,d,C),p?p.alias.push(x):(_=_||x,_!==x&&_.alias.push(x),g&&c.name&&!qi(x)&&o(c.name)),P.children){const U=P.children;for(let J=0;J<U.length;J++)i(U[J],x,p&&p.children[J])}p=p||x,(x.record.components&&Object.keys(x.record.components).length||x.record.name||x.record.redirect)&&s(x)}return _?()=>{o(_)}:fn}function o(c){if(Es(c)){const d=r.get(c);d&&(r.delete(c),n.splice(n.indexOf(d),1),d.children.forEach(o),d.alias.forEach(o))}else{const d=n.indexOf(c);d>-1&&(n.splice(d,1),c.record.name&&r.delete(c.record.name),c.children.forEach(o),c.alias.forEach(o))}}function l(){return n}function s(c){let d=0;for(;d<n.length&&iu(c,n[d])>=0&&(c.record.path!==n[d].record.path||!As(c,n[d]));)d++;n.splice(d,0,c),c.record.name&&!qi(c)&&r.set(c.record.name,c)}function f(c,d){let p,g={},P,C;if("name"in c&&c.name){if(p=r.get(c.name),!p)throw Yt(1,{location:c});C=p.record.name,g=X(Ki(d.params,p.keys.filter(_=>!_.optional).map(_=>_.name)),c.params&&Ki(c.params,p.keys.map(_=>_.name))),P=p.stringify(g)}else if("path"in c)P=c.path,p=n.find(_=>_.re.test(P)),p&&(g=p.parse(P),C=p.record.name);else{if(p=d.name?r.get(d.name):n.find(_=>_.re.test(d.path)),!p)throw Yt(1,{location:c,currentLocation:d});C=p.record.name,g=X({},d.params,c.params),P=p.stringify(g)}const F=[];let x=p;for(;x;)F.unshift(x.record),x=x.parent;return{name:C,path:P,params:g,matched:F,meta:mu(F)}}return e.forEach(c=>i(c)),{addRoute:i,resolve:f,removeRoute:o,getRoutes:l,getRecordMatcher:a}}function Ki(e,t){const n={};for(const r of t)r in e&&(n[r]=e[r]);return n}function uu(e){return{path:e.path,redirect:e.redirect,name:e.name,meta:e.meta||{},aliasOf:void 0,beforeEnter:e.beforeEnter,props:du(e),children:e.children||[],instances:{},leaveGuards:new Set,updateGuards:new Set,enterCallbacks:{},components:"components"in e?e.components||null:e.component&&{default:e.component}}}function du(e){const t={},n=e.props||!1;if("component"in e)t.default=n;else for(const r in e.components)t[r]=typeof n=="object"?n[r]:n;return t}function qi(e){for(;e;){if(e.record.aliasOf)return!0;e=e.parent}return!1}function mu(e){return e.reduce((t,n)=>X(t,n.meta),{})}function Vi(e,t){const n={};for(const r in e)n[r]=r in t?t[r]:e[r];return n}function As(e,t){return t.children.some(n=>n===e||As(e,n))}const Os=/#/g,pu=/&/g,hu=/\//g,gu=/=/g,vu=/\?/g,Ps=/\+/g,bu=/%5B/g,yu=/%5D/g,Cs=/%5E/g,xu=/%60/g,Ss=/%7B/g,_u=/%7C/g,Rs=/%7D/g,wu=/%20/g;function Ba(e){return encodeURI(""+e).replace(_u,"|").replace(bu,"[").replace(yu,"]")}function Eu(e){return Ba(e).replace(Ss,"{").replace(Rs,"}").replace(Cs,"^")}function ra(e){return Ba(e).replace(Ps,"%2B").replace(wu,"+").replace(Os,"%23").replace(pu,"%26").replace(xu,"`").replace(Ss,"{").replace(Rs,"}").replace(Cs,"^")}function ku(e){return ra(e).replace(gu,"%3D")}function Au(e){return Ba(e).replace(Os,"%23").replace(vu,"%3F")}function Ou(e){return e==null?"":Au(e).replace(hu,"%2F")}function sr(e){try{return decodeURIComponent(""+e)}catch{}return""+e}function Pu(e){const t={};if(e===""||e==="?")return t;const r=(e[0]==="?"?e.slice(1):e).split("&");for(let a=0;a<r.length;++a){const i=r[a].replace(Ps," "),o=i.indexOf("="),l=sr(o<0?i:i.slice(0,o)),s=o<0?null:sr(i.slice(o+1));if(l in t){let f=t[l];Fe(f)||(f=t[l]=[f]),f.push(s)}else t[l]=s}return t}function Xi(e){let t="";for(let n in e){const r=e[n];if(n=ku(n),r==null){r!==void 0&&(t+=(t.length?"&":"")+n);continue}(Fe(r)?r.map(i=>i&&ra(i)):[r&&ra(r)]).forEach(i=>{i!==void 0&&(t+=(t.length?"&":"")+n,i!=null&&(t+="="+i))})}return t}function Cu(e){const t={};for(const n in e){const r=e[n];r!==void 0&&(t[n]=Fe(r)?r.map(a=>a==null?null:""+a):r==null?r:""+r)}return t}const Su=Symbol(""),Gi=Symbol(""),Ua=Symbol(""),Is=Symbol(""),aa=Symbol("");function tn(){let e=[];function t(r){return e.push(r),()=>{const a=e.indexOf(r);a>-1&&e.splice(a,1)}}function n(){e=[]}return{add:t,list:()=>e.slice(),reset:n}}function ft(e,t,n,r,a){const i=r&&(r.enterCallbacks[a]=r.enterCallbacks[a]||[]);return()=>new Promise((o,l)=>{const s=d=>{d===!1?l(Yt(4,{from:n,to:t})):d instanceof Error?l(d):eu(d)?l(Yt(2,{from:t,to:d})):(i&&r.enterCallbacks[a]===i&&typeof d=="function"&&i.push(d),o())},f=e.call(r&&r.instances[a],t,n,s);let c=Promise.resolve(f);e.length<3&&(c=c.then(s)),c.catch(d=>l(d))})}function jr(e,t,n,r){const a=[];for(const i of e)for(const o in i.components){let l=i.components[o];if(!(t!=="beforeRouteEnter"&&!i.instances[o]))if(Ru(l)){const f=(l.__vccOpts||l)[t];f&&a.push(ft(f,n,r,i,o))}else{let s=l();a.push(()=>s.then(f=>{if(!f)return Promise.reject(new Error(`Couldn't resolve component "${o}" at "${i.path}"`));const c=Ff(f)?f.default:f;i.components[o]=c;const p=(c.__vccOpts||c)[t];return p&&ft(p,n,r,i,o)()}))}}return a}function Ru(e){return typeof e=="object"||"displayName"in e||"props"in e||"__vccOpts"in e}function Qi(e){const t=Qe(Ua),n=Qe(Is),r=ue(()=>t.resolve(Ge(e.to))),a=ue(()=>{const{matched:s}=r.value,{length:f}=s,c=s[f-1],d=n.matched;if(!c||!d.length)return-1;const p=d.findIndex(Wt.bind(null,c));if(p>-1)return p;const g=Ji(s[f-2]);return f>1&&Ji(c)===g&&d[d.length-1].path!==g?d.findIndex(Wt.bind(null,s[f-2])):p}),i=ue(()=>a.value>-1&&Nu(n.params,r.value.params)),o=ue(()=>a.value>-1&&a.value===n.matched.length-1&&_s(n.params,r.value.params));function l(s={}){return Tu(s)?t[Ge(e.replace)?"replace":"push"](Ge(e.to)).catch(fn):Promise.resolve()}return{route:r,href:ue(()=>r.value.href),isActive:i,isExactActive:o,navigate:l}}const Iu=Gt({name:"RouterLink",compatConfig:{MODE:3},props:{to:{type:[String,Object],required:!0},replace:Boolean,activeClass:String,exactActiveClass:String,custom:Boolean,ariaCurrentValue:{type:String,default:"page"}},useLink:Qi,setup(e,{slots:t}){const n=vr(Qi(e)),{options:r}=Qe(Ua),a=ue(()=>({[Zi(e.activeClass,r.linkActiveClass,"router-link-active")]:n.isActive,[Zi(e.exactActiveClass,r.linkExactActiveClass,"router-link-exact-active")]:n.isExactActive}));return()=>{const i=t.default&&t.default(n);return e.custom?i:Ha("a",{"aria-current":n.isExactActive?e.ariaCurrentValue:null,href:n.href,onClick:n.navigate,class:a.value},i)}}}),Zn=Iu;function Tu(e){if(!(e.metaKey||e.altKey||e.ctrlKey||e.shiftKey)&&!e.defaultPrevented&&!(e.button!==void 0&&e.button!==0)){if(e.currentTarget&&e.currentTarget.getAttribute){const t=e.currentTarget.getAttribute("target");if(/\b_blank\b/i.test(t))return}return e.preventDefault&&e.preventDefault(),!0}}function Nu(e,t){for(const n in t){const r=t[n],a=e[n];if(typeof r=="string"){if(r!==a)return!1}else if(!Fe(a)||a.length!==r.length||r.some((i,o)=>i!==a[o]))return!1}return!0}function Ji(e){return e?e.aliasOf?e.aliasOf.path:e.path:""}const Zi=(e,t,n)=>e??t??n,Mu=Gt({name:"RouterView",inheritAttrs:!1,props:{name:{type:String,default:"default"},route:Object},compatConfig:{MODE:3},setup(e,{attrs:t,slots:n}){const r=Qe(aa),a=ue(()=>e.route||r.value),i=Qe(Gi,0),o=ue(()=>{let f=Ge(i);const{matched:c}=a.value;let d;for(;(d=c[f])&&!d.components;)f++;return f}),l=ue(()=>a.value.matched[o.value]);Xn(Gi,ue(()=>o.value+1)),Xn(Su,l),Xn(aa,a);const s=Vo();return sn(()=>[s.value,l.value,e.name],([f,c,d],[p,g,P])=>{c&&(c.instances[d]=f,g&&g!==c&&f&&f===p&&(c.leaveGuards.size||(c.leaveGuards=g.leaveGuards),c.updateGuards.size||(c.updateGuards=g.updateGuards))),f&&c&&(!g||!Wt(c,g)||!p)&&(c.enterCallbacks[d]||[]).forEach(C=>C(f))},{flush:"post"}),()=>{const f=a.value,c=e.name,d=l.value,p=d&&d.components[c];if(!p)return eo(n.default,{Component:p,route:f});const g=d.props[c],P=g?g===!0?f.params:typeof g=="function"?g(f):g:null,F=Ha(p,X({},P,t,{onVnodeUnmounted:x=>{x.component.isUnmounted&&(d.instances[c]=null)},ref:s}));return eo(n.default,{Component:F,route:f})||F}}});function eo(e,t){if(!e)return null;const n=e(t);return n.length===1?n[0]:n}const Lu=Mu;function Fu(e){const t=fu(e.routes,e),n=e.parseQuery||Pu,r=e.stringifyQuery||Xi,a=e.history,i=tn(),o=tn(),l=tn(),s=Zl(st);let f=st;Nt&&e.scrollBehavior&&"scrollRestoration"in history&&(history.scrollRestoration="manual");const c=Lr.bind(null,b=>""+b),d=Lr.bind(null,Ou),p=Lr.bind(null,sr);function g(b,T){let O,j;return Es(b)?(O=t.getRecordMatcher(b),j=T):j=b,t.addRoute(j,O)}function P(b){const T=t.getRecordMatcher(b);T&&t.removeRoute(T)}function C(){return t.getRoutes().map(b=>b.record)}function F(b){return!!t.getRecordMatcher(b)}function x(b,T){if(T=X({},T||s.value),typeof b=="string"){const h=Fr(n,b,T.path),v=t.resolve({path:h.path},T),y=a.createHref(h.fullPath);return X(h,v,{params:p(v.params),hash:sr(h.hash),redirectedFrom:void 0,href:y})}let O;if("path"in b)O=X({},b,{path:Fr(n,b.path,T.path).path});else{const h=X({},b.params);for(const v in h)h[v]==null&&delete h[v];O=X({},b,{params:d(h)}),T.params=d(T.params)}const j=t.resolve(O,T),V=b.hash||"";j.params=c(p(j.params));const u=$f(r,X({},b,{hash:Eu(V),path:j.path})),m=a.createHref(u);return X({fullPath:u,hash:V,query:r===Xi?Cu(b.query):b.query||{}},j,{redirectedFrom:void 0,href:m})}function _(b){return typeof b=="string"?Fr(n,b,s.value.path):X({},b)}function L(b,T){if(f!==b)return Yt(8,{from:T,to:b})}function S(b){return re(b)}function U(b){return S(X(_(b),{replace:!0}))}function J(b){const T=b.matched[b.matched.length-1];if(T&&T.redirect){const{redirect:O}=T;let j=typeof O=="function"?O(b):O;return typeof j=="string"&&(j=j.includes("?")||j.includes("#")?j=_(j):{path:j},j.params={}),X({query:b.query,hash:b.hash,params:"path"in j?{}:b.params},j)}}function re(b,T){const O=f=x(b),j=s.value,V=b.state,u=b.force,m=b.replace===!0,h=J(O);if(h)return re(X(_(h),{state:typeof h=="object"?X({},V,h.state):V,force:u,replace:m}),T||O);const v=O;v.redirectedFrom=T;let y;return!u&&Df(r,j,O)&&(y=Yt(16,{to:v,from:j}),ze(j,j,!0,!1)),(y?Promise.resolve(y):Oe(v,j)).catch(w=>qe(w)?qe(w,2)?w:it(w):q(w,v,j)).then(w=>{if(w){if(qe(w,2))return re(X({replace:m},_(w.to),{state:typeof w.to=="object"?X({},V,w.to.state):V,force:u}),T||v)}else w=vt(v,j,!0,m,V);return at(v,j,w),w})}function Ee(b,T){const O=L(b,T);return O?Promise.reject(O):Promise.resolve()}function ve(b){const T=Rt.values().next().value;return T&&typeof T.runWithContext=="function"?T.runWithContext(b):b()}function Oe(b,T){let O;const[j,V,u]=ju(b,T);O=jr(j.reverse(),"beforeRouteLeave",b,T);for(const h of j)h.leaveGuards.forEach(v=>{O.push(ft(v,b,T))});const m=Ee.bind(null,b,T);return O.push(m),pe(O).then(()=>{O=[];for(const h of i.list())O.push(ft(h,b,T));return O.push(m),pe(O)}).then(()=>{O=jr(V,"beforeRouteUpdate",b,T);for(const h of V)h.updateGuards.forEach(v=>{O.push(ft(v,b,T))});return O.push(m),pe(O)}).then(()=>{O=[];for(const h of u)if(h.beforeEnter)if(Fe(h.beforeEnter))for(const v of h.beforeEnter)O.push(ft(v,b,T));else O.push(ft(h.beforeEnter,b,T));return O.push(m),pe(O)}).then(()=>(b.matched.forEach(h=>h.enterCallbacks={}),O=jr(u,"beforeRouteEnter",b,T),O.push(m),pe(O))).then(()=>{O=[];for(const h of o.list())O.push(ft(h,b,T));return O.push(m),pe(O)}).catch(h=>qe(h,8)?h:Promise.reject(h))}function at(b,T,O){l.list().forEach(j=>ve(()=>j(b,T,O)))}function vt(b,T,O,j,V){const u=L(b,T);if(u)return u;const m=T===st,h=Nt?history.state:{};O&&(j||m?a.replace(b.fullPath,X({scroll:m&&h&&h.scroll},V)):a.push(b.fullPath,V)),s.value=b,ze(b,T,O,m),it()}let je;function Jt(){je||(je=a.listen((b,T,O)=>{if(!Rn.listening)return;const j=x(b),V=J(j);if(V){re(X(V,{replace:!0}),j).catch(fn);return}f=j;const u=s.value;Nt&&Vf(Hi(u.fullPath,O.delta),Er()),Oe(j,u).catch(m=>qe(m,12)?m:qe(m,2)?(re(m.to,j).then(h=>{qe(h,20)&&!O.delta&&O.type===_n.pop&&a.go(-1,!1)}).catch(fn),Promise.reject()):(O.delta&&a.go(-O.delta,!1),q(m,j,u))).then(m=>{m=m||vt(j,u,!1),m&&(O.delta&&!qe(m,8)?a.go(-O.delta,!1):O.type===_n.pop&&qe(m,20)&&a.go(-1,!1)),at(j,u,m)}).catch(fn)}))}let Ct=tn(),ce=tn(),Q;function q(b,T,O){it(b);const j=ce.list();return j.length?j.forEach(V=>V(b,T,O)):console.error(b),Promise.reject(b)}function Ke(){return Q&&s.value!==st?Promise.resolve():new Promise((b,T)=>{Ct.add([b,T])})}function it(b){return Q||(Q=!b,Jt(),Ct.list().forEach(([T,O])=>b?O(b):T()),Ct.reset()),b}function ze(b,T,O,j){const{scrollBehavior:V}=e;if(!Nt||!V)return Promise.resolve();const u=!O&&Xf(Hi(b.fullPath,0))||(j||!O)&&history.state&&history.state.scroll||null;return Jo().then(()=>V(b,T,u)).then(m=>m&&qf(m)).catch(m=>q(m,b,T))}const ye=b=>a.go(b);let St;const Rt=new Set,Rn={currentRoute:s,listening:!0,addRoute:g,removeRoute:P,hasRoute:F,getRoutes:C,resolve:x,options:e,push:S,replace:U,go:ye,back:()=>ye(-1),forward:()=>ye(1),beforeEach:i.add,beforeResolve:o.add,afterEach:l.add,onError:ce.add,isReady:Ke,install(b){const T=this;b.component("RouterLink",Zn),b.component("RouterView",Lu),b.config.globalProperties.$router=T,Object.defineProperty(b.config.globalProperties,"$route",{enumerable:!0,get:()=>Ge(s)}),Nt&&!St&&s.value===st&&(St=!0,S(a.location).catch(V=>{}));const O={};for(const V in st)Object.defineProperty(O,V,{get:()=>s.value[V],enumerable:!0});b.provide(Ua,T),b.provide(Is,Uo(O)),b.provide(aa,s);const j=b.unmount;Rt.add(b),b.unmount=function(){Rt.delete(b),Rt.size<1&&(f=st,je&&je(),je=null,s.value=st,St=!1,Q=!1),j()}}};function pe(b){return b.reduce((T,O)=>T.then(()=>ve(O)),Promise.resolve())}return Rn}function ju(e,t){const n=[],r=[],a=[],i=Math.max(t.matched.length,e.matched.length);for(let o=0;o<i;o++){const l=t.matched[o];l&&(e.matched.find(f=>Wt(f,l))?r.push(l):n.push(l));const s=e.matched[o];s&&(t.matched.find(f=>Wt(f,s))||a.push(s))}return[n,r,a]}const Wa=(e,t)=>{const n=e.__vccOpts||e;for(const[r,a]of t)n[r]=a;return n},zu={};function $u(e,t){return null}const Du=Wa(zu,[["render",$u]]),Hu={};function Bu(e,t){return null}const Uu=Wa(Hu,[["render",Bu]]),Wu={};function Yu(e,t){return null}const Ku=Wa(Wu,[["render",Yu]]),qu={class:"container mx-auto my-auto"},Vu=Gt({__name:"HomeView",setup(e){return(t,n)=>(Fa(),ja("div",qu,[se(Du),se(Ku),se(Uu)]))}}),Xu=[{path:"/",name:"Home",component:Vu},{path:"/about",name:"About",component:()=>zi(()=>import("./AboutView-2fb2dfc3.js"),[],import.meta.url)},{path:"/chat",name:"Chat",component:()=>zi(()=>import("./ChatView-ffe48813.js"),["./ChatView-ffe48813.js","./ChatView-3ebf0331.css"],import.meta.url)}],Gu=Fu({history:Zf("./"),routes:Xu});var Qu=!1;/*!
 * pinia v2.1.6
 * (c) 2023 Eduardo San Martin Morote
 * @license MIT
 */const Ju=Symbol();var to;(function(e){e.direct="direct",e.patchObject="patch object",e.patchFunction="patch function"})(to||(to={}));function Zu(){const e=kl(!0),t=e.run(()=>Vo({}));let n=[],r=[];const a=Ra({install(i){a._a=i,i.provide(Ju,a),i.config.globalProperties.$pinia=a,r.forEach(o=>n.push(o)),r=[]},use(i){return!this._a&&!Qu?r.push(i):n.push(i),this},_p:n,_a:null,_e:e,_s:new Map,state:t});return a}function no(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter(function(a){return Object.getOwnPropertyDescriptor(e,a).enumerable})),n.push.apply(n,r)}return n}function I(e){for(var t=1;t<arguments.length;t++){var n=arguments[t]!=null?arguments[t]:{};t%2?no(Object(n),!0).forEach(function(r){le(e,r,n[r])}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):no(Object(n)).forEach(function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(n,r))})}return e}function lr(e){"@babel/helpers - typeof";return lr=typeof Symbol=="function"&&typeof Symbol.iterator=="symbol"?function(t){return typeof t}:function(t){return t&&typeof Symbol=="function"&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},lr(e)}function ed(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function ro(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}function td(e,t,n){return t&&ro(e.prototype,t),n&&ro(e,n),Object.defineProperty(e,"prototype",{writable:!1}),e}function le(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function Ya(e,t){return rd(e)||id(e,t)||Ts(e,t)||sd()}function Pn(e){return nd(e)||ad(e)||Ts(e)||od()}function nd(e){if(Array.isArray(e))return ia(e)}function rd(e){if(Array.isArray(e))return e}function ad(e){if(typeof Symbol<"u"&&e[Symbol.iterator]!=null||e["@@iterator"]!=null)return Array.from(e)}function id(e,t){var n=e==null?null:typeof Symbol<"u"&&e[Symbol.iterator]||e["@@iterator"];if(n!=null){var r=[],a=!0,i=!1,o,l;try{for(n=n.call(e);!(a=(o=n.next()).done)&&(r.push(o.value),!(t&&r.length===t));a=!0);}catch(s){i=!0,l=s}finally{try{!a&&n.return!=null&&n.return()}finally{if(i)throw l}}return r}}function Ts(e,t){if(e){if(typeof e=="string")return ia(e,t);var n=Object.prototype.toString.call(e).slice(8,-1);if(n==="Object"&&e.constructor&&(n=e.constructor.name),n==="Map"||n==="Set")return Array.from(e);if(n==="Arguments"||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))return ia(e,t)}}function ia(e,t){(t==null||t>e.length)&&(t=e.length);for(var n=0,r=new Array(t);n<t;n++)r[n]=e[n];return r}function od(){throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}function sd(){throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}var ao=function(){},Ka={},Ns={},Ms=null,Ls={mark:ao,measure:ao};try{typeof window<"u"&&(Ka=window),typeof document<"u"&&(Ns=document),typeof MutationObserver<"u"&&(Ms=MutationObserver),typeof performance<"u"&&(Ls=performance)}catch{}var ld=Ka.navigator||{},io=ld.userAgent,oo=io===void 0?"":io,pt=Ka,te=Ns,so=Ms,jn=Ls;pt.document;var rt=!!te.documentElement&&!!te.head&&typeof te.addEventListener=="function"&&typeof te.createElement=="function",Fs=~oo.indexOf("MSIE")||~oo.indexOf("Trident/"),zn,$n,Dn,Hn,Bn,Ze="___FONT_AWESOME___",oa=16,js="fa",zs="svg-inline--fa",Ot="data-fa-i2svg",sa="data-fa-pseudo-element",cd="data-fa-pseudo-element-pending",qa="data-prefix",Va="data-icon",lo="fontawesome-i2svg",fd="async",ud=["HTML","HEAD","STYLE","SCRIPT"],$s=function(){try{return!0}catch{return!1}}(),ee="classic",ae="sharp",Xa=[ee,ae];function Cn(e){return new Proxy(e,{get:function(n,r){return r in n?n[r]:n[ee]}})}var wn=Cn((zn={},le(zn,ee,{fa:"solid",fas:"solid","fa-solid":"solid",far:"regular","fa-regular":"regular",fal:"light","fa-light":"light",fat:"thin","fa-thin":"thin",fad:"duotone","fa-duotone":"duotone",fab:"brands","fa-brands":"brands",fak:"kit","fa-kit":"kit"}),le(zn,ae,{fa:"solid",fass:"solid","fa-solid":"solid",fasr:"regular","fa-regular":"regular",fasl:"light","fa-light":"light"}),zn)),En=Cn(($n={},le($n,ee,{solid:"fas",regular:"far",light:"fal",thin:"fat",duotone:"fad",brands:"fab",kit:"fak"}),le($n,ae,{solid:"fass",regular:"fasr",light:"fasl"}),$n)),kn=Cn((Dn={},le(Dn,ee,{fab:"fa-brands",fad:"fa-duotone",fak:"fa-kit",fal:"fa-light",far:"fa-regular",fas:"fa-solid",fat:"fa-thin"}),le(Dn,ae,{fass:"fa-solid",fasr:"fa-regular",fasl:"fa-light"}),Dn)),dd=Cn((Hn={},le(Hn,ee,{"fa-brands":"fab","fa-duotone":"fad","fa-kit":"fak","fa-light":"fal","fa-regular":"far","fa-solid":"fas","fa-thin":"fat"}),le(Hn,ae,{"fa-solid":"fass","fa-regular":"fasr","fa-light":"fasl"}),Hn)),md=/fa(s|r|l|t|d|b|k|ss|sr|sl)?[\-\ ]/,Ds="fa-layers-text",pd=/Font ?Awesome ?([56 ]*)(Solid|Regular|Light|Thin|Duotone|Brands|Free|Pro|Sharp|Kit)?.*/i,hd=Cn((Bn={},le(Bn,ee,{900:"fas",400:"far",normal:"far",300:"fal",100:"fat"}),le(Bn,ae,{900:"fass",400:"fasr",300:"fasl"}),Bn)),Hs=[1,2,3,4,5,6,7,8,9,10],gd=Hs.concat([11,12,13,14,15,16,17,18,19,20]),vd=["class","data-prefix","data-icon","data-fa-transform","data-fa-mask"],wt={GROUP:"duotone-group",SWAP_OPACITY:"swap-opacity",PRIMARY:"primary",SECONDARY:"secondary"},An=new Set;Object.keys(En[ee]).map(An.add.bind(An));Object.keys(En[ae]).map(An.add.bind(An));var bd=[].concat(Xa,Pn(An),["2xs","xs","sm","lg","xl","2xl","beat","border","fade","beat-fade","bounce","flip-both","flip-horizontal","flip-vertical","flip","fw","inverse","layers-counter","layers-text","layers","li","pull-left","pull-right","pulse","rotate-180","rotate-270","rotate-90","rotate-by","shake","spin-pulse","spin-reverse","spin","stack-1x","stack-2x","stack","ul",wt.GROUP,wt.SWAP_OPACITY,wt.PRIMARY,wt.SECONDARY]).concat(Hs.map(function(e){return"".concat(e,"x")})).concat(gd.map(function(e){return"w-".concat(e)})),dn=pt.FontAwesomeConfig||{};function yd(e){var t=te.querySelector("script["+e+"]");if(t)return t.getAttribute(e)}function xd(e){return e===""?!0:e==="false"?!1:e==="true"?!0:e}if(te&&typeof te.querySelector=="function"){var _d=[["data-family-prefix","familyPrefix"],["data-css-prefix","cssPrefix"],["data-family-default","familyDefault"],["data-style-default","styleDefault"],["data-replacement-class","replacementClass"],["data-auto-replace-svg","autoReplaceSvg"],["data-auto-add-css","autoAddCss"],["data-auto-a11y","autoA11y"],["data-search-pseudo-elements","searchPseudoElements"],["data-observe-mutations","observeMutations"],["data-mutate-approach","mutateApproach"],["data-keep-original-source","keepOriginalSource"],["data-measure-performance","measurePerformance"],["data-show-missing-icons","showMissingIcons"]];_d.forEach(function(e){var t=Ya(e,2),n=t[0],r=t[1],a=xd(yd(n));a!=null&&(dn[r]=a)})}var Bs={styleDefault:"solid",familyDefault:"classic",cssPrefix:js,replacementClass:zs,autoReplaceSvg:!0,autoAddCss:!0,autoA11y:!0,searchPseudoElements:!1,observeMutations:!0,mutateApproach:"async",keepOriginalSource:!0,measurePerformance:!1,showMissingIcons:!0};dn.familyPrefix&&(dn.cssPrefix=dn.familyPrefix);var Kt=I(I({},Bs),dn);Kt.autoReplaceSvg||(Kt.observeMutations=!1);var M={};Object.keys(Bs).forEach(function(e){Object.defineProperty(M,e,{enumerable:!0,set:function(n){Kt[e]=n,mn.forEach(function(r){return r(M)})},get:function(){return Kt[e]}})});Object.defineProperty(M,"familyPrefix",{enumerable:!0,set:function(t){Kt.cssPrefix=t,mn.forEach(function(n){return n(M)})},get:function(){return Kt.cssPrefix}});pt.FontAwesomeConfig=M;var mn=[];function wd(e){return mn.push(e),function(){mn.splice(mn.indexOf(e),1)}}var lt=oa,We={size:16,x:0,y:0,rotate:0,flipX:!1,flipY:!1};function Ed(e){if(!(!e||!rt)){var t=te.createElement("style");t.setAttribute("type","text/css"),t.innerHTML=e;for(var n=te.head.childNodes,r=null,a=n.length-1;a>-1;a--){var i=n[a],o=(i.tagName||"").toUpperCase();["STYLE","LINK"].indexOf(o)>-1&&(r=i)}return te.head.insertBefore(t,r),e}}var kd="0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";function On(){for(var e=12,t="";e-- >0;)t+=kd[Math.random()*62|0];return t}function Qt(e){for(var t=[],n=(e||[]).length>>>0;n--;)t[n]=e[n];return t}function Ga(e){return e.classList?Qt(e.classList):(e.getAttribute("class")||"").split(" ").filter(function(t){return t})}function Us(e){return"".concat(e).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/'/g,"&#39;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function Ad(e){return Object.keys(e||{}).reduce(function(t,n){return t+"".concat(n,'="').concat(Us(e[n]),'" ')},"").trim()}function kr(e){return Object.keys(e||{}).reduce(function(t,n){return t+"".concat(n,": ").concat(e[n].trim(),";")},"")}function Qa(e){return e.size!==We.size||e.x!==We.x||e.y!==We.y||e.rotate!==We.rotate||e.flipX||e.flipY}function Od(e){var t=e.transform,n=e.containerWidth,r=e.iconWidth,a={transform:"translate(".concat(n/2," 256)")},i="translate(".concat(t.x*32,", ").concat(t.y*32,") "),o="scale(".concat(t.size/16*(t.flipX?-1:1),", ").concat(t.size/16*(t.flipY?-1:1),") "),l="rotate(".concat(t.rotate," 0 0)"),s={transform:"".concat(i," ").concat(o," ").concat(l)},f={transform:"translate(".concat(r/2*-1," -256)")};return{outer:a,inner:s,path:f}}function Pd(e){var t=e.transform,n=e.width,r=n===void 0?oa:n,a=e.height,i=a===void 0?oa:a,o=e.startCentered,l=o===void 0?!1:o,s="";return l&&Fs?s+="translate(".concat(t.x/lt-r/2,"em, ").concat(t.y/lt-i/2,"em) "):l?s+="translate(calc(-50% + ".concat(t.x/lt,"em), calc(-50% + ").concat(t.y/lt,"em)) "):s+="translate(".concat(t.x/lt,"em, ").concat(t.y/lt,"em) "),s+="scale(".concat(t.size/lt*(t.flipX?-1:1),", ").concat(t.size/lt*(t.flipY?-1:1),") "),s+="rotate(".concat(t.rotate,"deg) "),s}var Cd=`:root, :host {
  --fa-font-solid: normal 900 1em/1 "Font Awesome 6 Solid";
  --fa-font-regular: normal 400 1em/1 "Font Awesome 6 Regular";
  --fa-font-light: normal 300 1em/1 "Font Awesome 6 Light";
  --fa-font-thin: normal 100 1em/1 "Font Awesome 6 Thin";
  --fa-font-duotone: normal 900 1em/1 "Font Awesome 6 Duotone";
  --fa-font-sharp-solid: normal 900 1em/1 "Font Awesome 6 Sharp";
  --fa-font-sharp-regular: normal 400 1em/1 "Font Awesome 6 Sharp";
  --fa-font-sharp-light: normal 300 1em/1 "Font Awesome 6 Sharp";
  --fa-font-brands: normal 400 1em/1 "Font Awesome 6 Brands";
}

svg:not(:root).svg-inline--fa, svg:not(:host).svg-inline--fa {
  overflow: visible;
  box-sizing: content-box;
}

.svg-inline--fa {
  display: var(--fa-display, inline-block);
  height: 1em;
  overflow: visible;
  vertical-align: -0.125em;
}
.svg-inline--fa.fa-2xs {
  vertical-align: 0.1em;
}
.svg-inline--fa.fa-xs {
  vertical-align: 0em;
}
.svg-inline--fa.fa-sm {
  vertical-align: -0.0714285705em;
}
.svg-inline--fa.fa-lg {
  vertical-align: -0.2em;
}
.svg-inline--fa.fa-xl {
  vertical-align: -0.25em;
}
.svg-inline--fa.fa-2xl {
  vertical-align: -0.3125em;
}
.svg-inline--fa.fa-pull-left {
  margin-right: var(--fa-pull-margin, 0.3em);
  width: auto;
}
.svg-inline--fa.fa-pull-right {
  margin-left: var(--fa-pull-margin, 0.3em);
  width: auto;
}
.svg-inline--fa.fa-li {
  width: var(--fa-li-width, 2em);
  top: 0.25em;
}
.svg-inline--fa.fa-fw {
  width: var(--fa-fw-width, 1.25em);
}

.fa-layers svg.svg-inline--fa {
  bottom: 0;
  left: 0;
  margin: auto;
  position: absolute;
  right: 0;
  top: 0;
}

.fa-layers-counter, .fa-layers-text {
  display: inline-block;
  position: absolute;
  text-align: center;
}

.fa-layers {
  display: inline-block;
  height: 1em;
  position: relative;
  text-align: center;
  vertical-align: -0.125em;
  width: 1em;
}
.fa-layers svg.svg-inline--fa {
  -webkit-transform-origin: center center;
          transform-origin: center center;
}

.fa-layers-text {
  left: 50%;
  top: 50%;
  -webkit-transform: translate(-50%, -50%);
          transform: translate(-50%, -50%);
  -webkit-transform-origin: center center;
          transform-origin: center center;
}

.fa-layers-counter {
  background-color: var(--fa-counter-background-color, #ff253a);
  border-radius: var(--fa-counter-border-radius, 1em);
  box-sizing: border-box;
  color: var(--fa-inverse, #fff);
  line-height: var(--fa-counter-line-height, 1);
  max-width: var(--fa-counter-max-width, 5em);
  min-width: var(--fa-counter-min-width, 1.5em);
  overflow: hidden;
  padding: var(--fa-counter-padding, 0.25em 0.5em);
  right: var(--fa-right, 0);
  text-overflow: ellipsis;
  top: var(--fa-top, 0);
  -webkit-transform: scale(var(--fa-counter-scale, 0.25));
          transform: scale(var(--fa-counter-scale, 0.25));
  -webkit-transform-origin: top right;
          transform-origin: top right;
}

.fa-layers-bottom-right {
  bottom: var(--fa-bottom, 0);
  right: var(--fa-right, 0);
  top: auto;
  -webkit-transform: scale(var(--fa-layers-scale, 0.25));
          transform: scale(var(--fa-layers-scale, 0.25));
  -webkit-transform-origin: bottom right;
          transform-origin: bottom right;
}

.fa-layers-bottom-left {
  bottom: var(--fa-bottom, 0);
  left: var(--fa-left, 0);
  right: auto;
  top: auto;
  -webkit-transform: scale(var(--fa-layers-scale, 0.25));
          transform: scale(var(--fa-layers-scale, 0.25));
  -webkit-transform-origin: bottom left;
          transform-origin: bottom left;
}

.fa-layers-top-right {
  top: var(--fa-top, 0);
  right: var(--fa-right, 0);
  -webkit-transform: scale(var(--fa-layers-scale, 0.25));
          transform: scale(var(--fa-layers-scale, 0.25));
  -webkit-transform-origin: top right;
          transform-origin: top right;
}

.fa-layers-top-left {
  left: var(--fa-left, 0);
  right: auto;
  top: var(--fa-top, 0);
  -webkit-transform: scale(var(--fa-layers-scale, 0.25));
          transform: scale(var(--fa-layers-scale, 0.25));
  -webkit-transform-origin: top left;
          transform-origin: top left;
}

.fa-1x {
  font-size: 1em;
}

.fa-2x {
  font-size: 2em;
}

.fa-3x {
  font-size: 3em;
}

.fa-4x {
  font-size: 4em;
}

.fa-5x {
  font-size: 5em;
}

.fa-6x {
  font-size: 6em;
}

.fa-7x {
  font-size: 7em;
}

.fa-8x {
  font-size: 8em;
}

.fa-9x {
  font-size: 9em;
}

.fa-10x {
  font-size: 10em;
}

.fa-2xs {
  font-size: 0.625em;
  line-height: 0.1em;
  vertical-align: 0.225em;
}

.fa-xs {
  font-size: 0.75em;
  line-height: 0.0833333337em;
  vertical-align: 0.125em;
}

.fa-sm {
  font-size: 0.875em;
  line-height: 0.0714285718em;
  vertical-align: 0.0535714295em;
}

.fa-lg {
  font-size: 1.25em;
  line-height: 0.05em;
  vertical-align: -0.075em;
}

.fa-xl {
  font-size: 1.5em;
  line-height: 0.0416666682em;
  vertical-align: -0.125em;
}

.fa-2xl {
  font-size: 2em;
  line-height: 0.03125em;
  vertical-align: -0.1875em;
}

.fa-fw {
  text-align: center;
  width: 1.25em;
}

.fa-ul {
  list-style-type: none;
  margin-left: var(--fa-li-margin, 2.5em);
  padding-left: 0;
}
.fa-ul > li {
  position: relative;
}

.fa-li {
  left: calc(var(--fa-li-width, 2em) * -1);
  position: absolute;
  text-align: center;
  width: var(--fa-li-width, 2em);
  line-height: inherit;
}

.fa-border {
  border-color: var(--fa-border-color, #eee);
  border-radius: var(--fa-border-radius, 0.1em);
  border-style: var(--fa-border-style, solid);
  border-width: var(--fa-border-width, 0.08em);
  padding: var(--fa-border-padding, 0.2em 0.25em 0.15em);
}

.fa-pull-left {
  float: left;
  margin-right: var(--fa-pull-margin, 0.3em);
}

.fa-pull-right {
  float: right;
  margin-left: var(--fa-pull-margin, 0.3em);
}

.fa-beat {
  -webkit-animation-name: fa-beat;
          animation-name: fa-beat;
  -webkit-animation-delay: var(--fa-animation-delay, 0s);
          animation-delay: var(--fa-animation-delay, 0s);
  -webkit-animation-direction: var(--fa-animation-direction, normal);
          animation-direction: var(--fa-animation-direction, normal);
  -webkit-animation-duration: var(--fa-animation-duration, 1s);
          animation-duration: var(--fa-animation-duration, 1s);
  -webkit-animation-iteration-count: var(--fa-animation-iteration-count, infinite);
          animation-iteration-count: var(--fa-animation-iteration-count, infinite);
  -webkit-animation-timing-function: var(--fa-animation-timing, ease-in-out);
          animation-timing-function: var(--fa-animation-timing, ease-in-out);
}

.fa-bounce {
  -webkit-animation-name: fa-bounce;
          animation-name: fa-bounce;
  -webkit-animation-delay: var(--fa-animation-delay, 0s);
          animation-delay: var(--fa-animation-delay, 0s);
  -webkit-animation-direction: var(--fa-animation-direction, normal);
          animation-direction: var(--fa-animation-direction, normal);
  -webkit-animation-duration: var(--fa-animation-duration, 1s);
          animation-duration: var(--fa-animation-duration, 1s);
  -webkit-animation-iteration-count: var(--fa-animation-iteration-count, infinite);
          animation-iteration-count: var(--fa-animation-iteration-count, infinite);
  -webkit-animation-timing-function: var(--fa-animation-timing, cubic-bezier(0.28, 0.84, 0.42, 1));
          animation-timing-function: var(--fa-animation-timing, cubic-bezier(0.28, 0.84, 0.42, 1));
}

.fa-fade {
  -webkit-animation-name: fa-fade;
          animation-name: fa-fade;
  -webkit-animation-delay: var(--fa-animation-delay, 0s);
          animation-delay: var(--fa-animation-delay, 0s);
  -webkit-animation-direction: var(--fa-animation-direction, normal);
          animation-direction: var(--fa-animation-direction, normal);
  -webkit-animation-duration: var(--fa-animation-duration, 1s);
          animation-duration: var(--fa-animation-duration, 1s);
  -webkit-animation-iteration-count: var(--fa-animation-iteration-count, infinite);
          animation-iteration-count: var(--fa-animation-iteration-count, infinite);
  -webkit-animation-timing-function: var(--fa-animation-timing, cubic-bezier(0.4, 0, 0.6, 1));
          animation-timing-function: var(--fa-animation-timing, cubic-bezier(0.4, 0, 0.6, 1));
}

.fa-beat-fade {
  -webkit-animation-name: fa-beat-fade;
          animation-name: fa-beat-fade;
  -webkit-animation-delay: var(--fa-animation-delay, 0s);
          animation-delay: var(--fa-animation-delay, 0s);
  -webkit-animation-direction: var(--fa-animation-direction, normal);
          animation-direction: var(--fa-animation-direction, normal);
  -webkit-animation-duration: var(--fa-animation-duration, 1s);
          animation-duration: var(--fa-animation-duration, 1s);
  -webkit-animation-iteration-count: var(--fa-animation-iteration-count, infinite);
          animation-iteration-count: var(--fa-animation-iteration-count, infinite);
  -webkit-animation-timing-function: var(--fa-animation-timing, cubic-bezier(0.4, 0, 0.6, 1));
          animation-timing-function: var(--fa-animation-timing, cubic-bezier(0.4, 0, 0.6, 1));
}

.fa-flip {
  -webkit-animation-name: fa-flip;
          animation-name: fa-flip;
  -webkit-animation-delay: var(--fa-animation-delay, 0s);
          animation-delay: var(--fa-animation-delay, 0s);
  -webkit-animation-direction: var(--fa-animation-direction, normal);
          animation-direction: var(--fa-animation-direction, normal);
  -webkit-animation-duration: var(--fa-animation-duration, 1s);
          animation-duration: var(--fa-animation-duration, 1s);
  -webkit-animation-iteration-count: var(--fa-animation-iteration-count, infinite);
          animation-iteration-count: var(--fa-animation-iteration-count, infinite);
  -webkit-animation-timing-function: var(--fa-animation-timing, ease-in-out);
          animation-timing-function: var(--fa-animation-timing, ease-in-out);
}

.fa-shake {
  -webkit-animation-name: fa-shake;
          animation-name: fa-shake;
  -webkit-animation-delay: var(--fa-animation-delay, 0s);
          animation-delay: var(--fa-animation-delay, 0s);
  -webkit-animation-direction: var(--fa-animation-direction, normal);
          animation-direction: var(--fa-animation-direction, normal);
  -webkit-animation-duration: var(--fa-animation-duration, 1s);
          animation-duration: var(--fa-animation-duration, 1s);
  -webkit-animation-iteration-count: var(--fa-animation-iteration-count, infinite);
          animation-iteration-count: var(--fa-animation-iteration-count, infinite);
  -webkit-animation-timing-function: var(--fa-animation-timing, linear);
          animation-timing-function: var(--fa-animation-timing, linear);
}

.fa-spin {
  -webkit-animation-name: fa-spin;
          animation-name: fa-spin;
  -webkit-animation-delay: var(--fa-animation-delay, 0s);
          animation-delay: var(--fa-animation-delay, 0s);
  -webkit-animation-direction: var(--fa-animation-direction, normal);
          animation-direction: var(--fa-animation-direction, normal);
  -webkit-animation-duration: var(--fa-animation-duration, 2s);
          animation-duration: var(--fa-animation-duration, 2s);
  -webkit-animation-iteration-count: var(--fa-animation-iteration-count, infinite);
          animation-iteration-count: var(--fa-animation-iteration-count, infinite);
  -webkit-animation-timing-function: var(--fa-animation-timing, linear);
          animation-timing-function: var(--fa-animation-timing, linear);
}

.fa-spin-reverse {
  --fa-animation-direction: reverse;
}

.fa-pulse,
.fa-spin-pulse {
  -webkit-animation-name: fa-spin;
          animation-name: fa-spin;
  -webkit-animation-direction: var(--fa-animation-direction, normal);
          animation-direction: var(--fa-animation-direction, normal);
  -webkit-animation-duration: var(--fa-animation-duration, 1s);
          animation-duration: var(--fa-animation-duration, 1s);
  -webkit-animation-iteration-count: var(--fa-animation-iteration-count, infinite);
          animation-iteration-count: var(--fa-animation-iteration-count, infinite);
  -webkit-animation-timing-function: var(--fa-animation-timing, steps(8));
          animation-timing-function: var(--fa-animation-timing, steps(8));
}

@media (prefers-reduced-motion: reduce) {
  .fa-beat,
.fa-bounce,
.fa-fade,
.fa-beat-fade,
.fa-flip,
.fa-pulse,
.fa-shake,
.fa-spin,
.fa-spin-pulse {
    -webkit-animation-delay: -1ms;
            animation-delay: -1ms;
    -webkit-animation-duration: 1ms;
            animation-duration: 1ms;
    -webkit-animation-iteration-count: 1;
            animation-iteration-count: 1;
    -webkit-transition-delay: 0s;
            transition-delay: 0s;
    -webkit-transition-duration: 0s;
            transition-duration: 0s;
  }
}
@-webkit-keyframes fa-beat {
  0%, 90% {
    -webkit-transform: scale(1);
            transform: scale(1);
  }
  45% {
    -webkit-transform: scale(var(--fa-beat-scale, 1.25));
            transform: scale(var(--fa-beat-scale, 1.25));
  }
}
@keyframes fa-beat {
  0%, 90% {
    -webkit-transform: scale(1);
            transform: scale(1);
  }
  45% {
    -webkit-transform: scale(var(--fa-beat-scale, 1.25));
            transform: scale(var(--fa-beat-scale, 1.25));
  }
}
@-webkit-keyframes fa-bounce {
  0% {
    -webkit-transform: scale(1, 1) translateY(0);
            transform: scale(1, 1) translateY(0);
  }
  10% {
    -webkit-transform: scale(var(--fa-bounce-start-scale-x, 1.1), var(--fa-bounce-start-scale-y, 0.9)) translateY(0);
            transform: scale(var(--fa-bounce-start-scale-x, 1.1), var(--fa-bounce-start-scale-y, 0.9)) translateY(0);
  }
  30% {
    -webkit-transform: scale(var(--fa-bounce-jump-scale-x, 0.9), var(--fa-bounce-jump-scale-y, 1.1)) translateY(var(--fa-bounce-height, -0.5em));
            transform: scale(var(--fa-bounce-jump-scale-x, 0.9), var(--fa-bounce-jump-scale-y, 1.1)) translateY(var(--fa-bounce-height, -0.5em));
  }
  50% {
    -webkit-transform: scale(var(--fa-bounce-land-scale-x, 1.05), var(--fa-bounce-land-scale-y, 0.95)) translateY(0);
            transform: scale(var(--fa-bounce-land-scale-x, 1.05), var(--fa-bounce-land-scale-y, 0.95)) translateY(0);
  }
  57% {
    -webkit-transform: scale(1, 1) translateY(var(--fa-bounce-rebound, -0.125em));
            transform: scale(1, 1) translateY(var(--fa-bounce-rebound, -0.125em));
  }
  64% {
    -webkit-transform: scale(1, 1) translateY(0);
            transform: scale(1, 1) translateY(0);
  }
  100% {
    -webkit-transform: scale(1, 1) translateY(0);
            transform: scale(1, 1) translateY(0);
  }
}
@keyframes fa-bounce {
  0% {
    -webkit-transform: scale(1, 1) translateY(0);
            transform: scale(1, 1) translateY(0);
  }
  10% {
    -webkit-transform: scale(var(--fa-bounce-start-scale-x, 1.1), var(--fa-bounce-start-scale-y, 0.9)) translateY(0);
            transform: scale(var(--fa-bounce-start-scale-x, 1.1), var(--fa-bounce-start-scale-y, 0.9)) translateY(0);
  }
  30% {
    -webkit-transform: scale(var(--fa-bounce-jump-scale-x, 0.9), var(--fa-bounce-jump-scale-y, 1.1)) translateY(var(--fa-bounce-height, -0.5em));
            transform: scale(var(--fa-bounce-jump-scale-x, 0.9), var(--fa-bounce-jump-scale-y, 1.1)) translateY(var(--fa-bounce-height, -0.5em));
  }
  50% {
    -webkit-transform: scale(var(--fa-bounce-land-scale-x, 1.05), var(--fa-bounce-land-scale-y, 0.95)) translateY(0);
            transform: scale(var(--fa-bounce-land-scale-x, 1.05), var(--fa-bounce-land-scale-y, 0.95)) translateY(0);
  }
  57% {
    -webkit-transform: scale(1, 1) translateY(var(--fa-bounce-rebound, -0.125em));
            transform: scale(1, 1) translateY(var(--fa-bounce-rebound, -0.125em));
  }
  64% {
    -webkit-transform: scale(1, 1) translateY(0);
            transform: scale(1, 1) translateY(0);
  }
  100% {
    -webkit-transform: scale(1, 1) translateY(0);
            transform: scale(1, 1) translateY(0);
  }
}
@-webkit-keyframes fa-fade {
  50% {
    opacity: var(--fa-fade-opacity, 0.4);
  }
}
@keyframes fa-fade {
  50% {
    opacity: var(--fa-fade-opacity, 0.4);
  }
}
@-webkit-keyframes fa-beat-fade {
  0%, 100% {
    opacity: var(--fa-beat-fade-opacity, 0.4);
    -webkit-transform: scale(1);
            transform: scale(1);
  }
  50% {
    opacity: 1;
    -webkit-transform: scale(var(--fa-beat-fade-scale, 1.125));
            transform: scale(var(--fa-beat-fade-scale, 1.125));
  }
}
@keyframes fa-beat-fade {
  0%, 100% {
    opacity: var(--fa-beat-fade-opacity, 0.4);
    -webkit-transform: scale(1);
            transform: scale(1);
  }
  50% {
    opacity: 1;
    -webkit-transform: scale(var(--fa-beat-fade-scale, 1.125));
            transform: scale(var(--fa-beat-fade-scale, 1.125));
  }
}
@-webkit-keyframes fa-flip {
  50% {
    -webkit-transform: rotate3d(var(--fa-flip-x, 0), var(--fa-flip-y, 1), var(--fa-flip-z, 0), var(--fa-flip-angle, -180deg));
            transform: rotate3d(var(--fa-flip-x, 0), var(--fa-flip-y, 1), var(--fa-flip-z, 0), var(--fa-flip-angle, -180deg));
  }
}
@keyframes fa-flip {
  50% {
    -webkit-transform: rotate3d(var(--fa-flip-x, 0), var(--fa-flip-y, 1), var(--fa-flip-z, 0), var(--fa-flip-angle, -180deg));
            transform: rotate3d(var(--fa-flip-x, 0), var(--fa-flip-y, 1), var(--fa-flip-z, 0), var(--fa-flip-angle, -180deg));
  }
}
@-webkit-keyframes fa-shake {
  0% {
    -webkit-transform: rotate(-15deg);
            transform: rotate(-15deg);
  }
  4% {
    -webkit-transform: rotate(15deg);
            transform: rotate(15deg);
  }
  8%, 24% {
    -webkit-transform: rotate(-18deg);
            transform: rotate(-18deg);
  }
  12%, 28% {
    -webkit-transform: rotate(18deg);
            transform: rotate(18deg);
  }
  16% {
    -webkit-transform: rotate(-22deg);
            transform: rotate(-22deg);
  }
  20% {
    -webkit-transform: rotate(22deg);
            transform: rotate(22deg);
  }
  32% {
    -webkit-transform: rotate(-12deg);
            transform: rotate(-12deg);
  }
  36% {
    -webkit-transform: rotate(12deg);
            transform: rotate(12deg);
  }
  40%, 100% {
    -webkit-transform: rotate(0deg);
            transform: rotate(0deg);
  }
}
@keyframes fa-shake {
  0% {
    -webkit-transform: rotate(-15deg);
            transform: rotate(-15deg);
  }
  4% {
    -webkit-transform: rotate(15deg);
            transform: rotate(15deg);
  }
  8%, 24% {
    -webkit-transform: rotate(-18deg);
            transform: rotate(-18deg);
  }
  12%, 28% {
    -webkit-transform: rotate(18deg);
            transform: rotate(18deg);
  }
  16% {
    -webkit-transform: rotate(-22deg);
            transform: rotate(-22deg);
  }
  20% {
    -webkit-transform: rotate(22deg);
            transform: rotate(22deg);
  }
  32% {
    -webkit-transform: rotate(-12deg);
            transform: rotate(-12deg);
  }
  36% {
    -webkit-transform: rotate(12deg);
            transform: rotate(12deg);
  }
  40%, 100% {
    -webkit-transform: rotate(0deg);
            transform: rotate(0deg);
  }
}
@-webkit-keyframes fa-spin {
  0% {
    -webkit-transform: rotate(0deg);
            transform: rotate(0deg);
  }
  100% {
    -webkit-transform: rotate(360deg);
            transform: rotate(360deg);
  }
}
@keyframes fa-spin {
  0% {
    -webkit-transform: rotate(0deg);
            transform: rotate(0deg);
  }
  100% {
    -webkit-transform: rotate(360deg);
            transform: rotate(360deg);
  }
}
.fa-rotate-90 {
  -webkit-transform: rotate(90deg);
          transform: rotate(90deg);
}

.fa-rotate-180 {
  -webkit-transform: rotate(180deg);
          transform: rotate(180deg);
}

.fa-rotate-270 {
  -webkit-transform: rotate(270deg);
          transform: rotate(270deg);
}

.fa-flip-horizontal {
  -webkit-transform: scale(-1, 1);
          transform: scale(-1, 1);
}

.fa-flip-vertical {
  -webkit-transform: scale(1, -1);
          transform: scale(1, -1);
}

.fa-flip-both,
.fa-flip-horizontal.fa-flip-vertical {
  -webkit-transform: scale(-1, -1);
          transform: scale(-1, -1);
}

.fa-rotate-by {
  -webkit-transform: rotate(var(--fa-rotate-angle, none));
          transform: rotate(var(--fa-rotate-angle, none));
}

.fa-stack {
  display: inline-block;
  vertical-align: middle;
  height: 2em;
  position: relative;
  width: 2.5em;
}

.fa-stack-1x,
.fa-stack-2x {
  bottom: 0;
  left: 0;
  margin: auto;
  position: absolute;
  right: 0;
  top: 0;
  z-index: var(--fa-stack-z-index, auto);
}

.svg-inline--fa.fa-stack-1x {
  height: 1em;
  width: 1.25em;
}
.svg-inline--fa.fa-stack-2x {
  height: 2em;
  width: 2.5em;
}

.fa-inverse {
  color: var(--fa-inverse, #fff);
}

.sr-only,
.fa-sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

.sr-only-focusable:not(:focus),
.fa-sr-only-focusable:not(:focus) {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

.svg-inline--fa .fa-primary {
  fill: var(--fa-primary-color, currentColor);
  opacity: var(--fa-primary-opacity, 1);
}

.svg-inline--fa .fa-secondary {
  fill: var(--fa-secondary-color, currentColor);
  opacity: var(--fa-secondary-opacity, 0.4);
}

.svg-inline--fa.fa-swap-opacity .fa-primary {
  opacity: var(--fa-secondary-opacity, 0.4);
}

.svg-inline--fa.fa-swap-opacity .fa-secondary {
  opacity: var(--fa-primary-opacity, 1);
}

.svg-inline--fa mask .fa-primary,
.svg-inline--fa mask .fa-secondary {
  fill: black;
}

.fad.fa-inverse,
.fa-duotone.fa-inverse {
  color: var(--fa-inverse, #fff);
}`;function Ws(){var e=js,t=zs,n=M.cssPrefix,r=M.replacementClass,a=Cd;if(n!==e||r!==t){var i=new RegExp("\\.".concat(e,"\\-"),"g"),o=new RegExp("\\--".concat(e,"\\-"),"g"),l=new RegExp("\\.".concat(t),"g");a=a.replace(i,".".concat(n,"-")).replace(o,"--".concat(n,"-")).replace(l,".".concat(r))}return a}var co=!1;function zr(){M.autoAddCss&&!co&&(Ed(Ws()),co=!0)}var Sd={mixout:function(){return{dom:{css:Ws,insertCss:zr}}},hooks:function(){return{beforeDOMElementCreation:function(){zr()},beforeI2svg:function(){zr()}}}},et=pt||{};et[Ze]||(et[Ze]={});et[Ze].styles||(et[Ze].styles={});et[Ze].hooks||(et[Ze].hooks={});et[Ze].shims||(et[Ze].shims=[]);var Ne=et[Ze],Ys=[],Rd=function e(){te.removeEventListener("DOMContentLoaded",e),cr=1,Ys.map(function(t){return t()})},cr=!1;rt&&(cr=(te.documentElement.doScroll?/^loaded|^c/:/^loaded|^i|^c/).test(te.readyState),cr||te.addEventListener("DOMContentLoaded",Rd));function Id(e){rt&&(cr?setTimeout(e,0):Ys.push(e))}function Sn(e){var t=e.tag,n=e.attributes,r=n===void 0?{}:n,a=e.children,i=a===void 0?[]:a;return typeof e=="string"?Us(e):"<".concat(t," ").concat(Ad(r),">").concat(i.map(Sn).join(""),"</").concat(t,">")}function fo(e,t,n){if(e&&e[t]&&e[t][n])return{prefix:t,iconName:n,icon:e[t][n]}}var Td=function(t,n){return function(r,a,i,o){return t.call(n,r,a,i,o)}},$r=function(t,n,r,a){var i=Object.keys(t),o=i.length,l=a!==void 0?Td(n,a):n,s,f,c;for(r===void 0?(s=1,c=t[i[0]]):(s=0,c=r);s<o;s++)f=i[s],c=l(c,t[f],f,t);return c};function Nd(e){for(var t=[],n=0,r=e.length;n<r;){var a=e.charCodeAt(n++);if(a>=55296&&a<=56319&&n<r){var i=e.charCodeAt(n++);(i&64512)==56320?t.push(((a&1023)<<10)+(i&1023)+65536):(t.push(a),n--)}else t.push(a)}return t}function la(e){var t=Nd(e);return t.length===1?t[0].toString(16):null}function Md(e,t){var n=e.length,r=e.charCodeAt(t),a;return r>=55296&&r<=56319&&n>t+1&&(a=e.charCodeAt(t+1),a>=56320&&a<=57343)?(r-55296)*1024+a-56320+65536:r}function uo(e){return Object.keys(e).reduce(function(t,n){var r=e[n],a=!!r.icon;return a?t[r.iconName]=r.icon:t[n]=r,t},{})}function ca(e,t){var n=arguments.length>2&&arguments[2]!==void 0?arguments[2]:{},r=n.skipHooks,a=r===void 0?!1:r,i=uo(t);typeof Ne.hooks.addPack=="function"&&!a?Ne.hooks.addPack(e,uo(t)):Ne.styles[e]=I(I({},Ne.styles[e]||{}),i),e==="fas"&&ca("fa",t)}var Un,Wn,Yn,Lt=Ne.styles,Ld=Ne.shims,Fd=(Un={},le(Un,ee,Object.values(kn[ee])),le(Un,ae,Object.values(kn[ae])),Un),Ja=null,Ks={},qs={},Vs={},Xs={},Gs={},jd=(Wn={},le(Wn,ee,Object.keys(wn[ee])),le(Wn,ae,Object.keys(wn[ae])),Wn);function zd(e){return~bd.indexOf(e)}function $d(e,t){var n=t.split("-"),r=n[0],a=n.slice(1).join("-");return r===e&&a!==""&&!zd(a)?a:null}var Qs=function(){var t=function(i){return $r(Lt,function(o,l,s){return o[s]=$r(l,i,{}),o},{})};Ks=t(function(a,i,o){if(i[3]&&(a[i[3]]=o),i[2]){var l=i[2].filter(function(s){return typeof s=="number"});l.forEach(function(s){a[s.toString(16)]=o})}return a}),qs=t(function(a,i,o){if(a[o]=o,i[2]){var l=i[2].filter(function(s){return typeof s=="string"});l.forEach(function(s){a[s]=o})}return a}),Gs=t(function(a,i,o){var l=i[2];return a[o]=o,l.forEach(function(s){a[s]=o}),a});var n="far"in Lt||M.autoFetchSvg,r=$r(Ld,function(a,i){var o=i[0],l=i[1],s=i[2];return l==="far"&&!n&&(l="fas"),typeof o=="string"&&(a.names[o]={prefix:l,iconName:s}),typeof o=="number"&&(a.unicodes[o.toString(16)]={prefix:l,iconName:s}),a},{names:{},unicodes:{}});Vs=r.names,Xs=r.unicodes,Ja=Ar(M.styleDefault,{family:M.familyDefault})};wd(function(e){Ja=Ar(e.styleDefault,{family:M.familyDefault})});Qs();function Za(e,t){return(Ks[e]||{})[t]}function Dd(e,t){return(qs[e]||{})[t]}function Et(e,t){return(Gs[e]||{})[t]}function Js(e){return Vs[e]||{prefix:null,iconName:null}}function Hd(e){var t=Xs[e],n=Za("fas",e);return t||(n?{prefix:"fas",iconName:n}:null)||{prefix:null,iconName:null}}function ht(){return Ja}var ei=function(){return{prefix:null,iconName:null,rest:[]}};function Ar(e){var t=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},n=t.family,r=n===void 0?ee:n,a=wn[r][e],i=En[r][e]||En[r][a],o=e in Ne.styles?e:null;return i||o||null}var mo=(Yn={},le(Yn,ee,Object.keys(kn[ee])),le(Yn,ae,Object.keys(kn[ae])),Yn);function Or(e){var t,n=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},r=n.skipLookups,a=r===void 0?!1:r,i=(t={},le(t,ee,"".concat(M.cssPrefix,"-").concat(ee)),le(t,ae,"".concat(M.cssPrefix,"-").concat(ae)),t),o=null,l=ee;(e.includes(i[ee])||e.some(function(f){return mo[ee].includes(f)}))&&(l=ee),(e.includes(i[ae])||e.some(function(f){return mo[ae].includes(f)}))&&(l=ae);var s=e.reduce(function(f,c){var d=$d(M.cssPrefix,c);if(Lt[c]?(c=Fd[l].includes(c)?dd[l][c]:c,o=c,f.prefix=c):jd[l].indexOf(c)>-1?(o=c,f.prefix=Ar(c,{family:l})):d?f.iconName=d:c!==M.replacementClass&&c!==i[ee]&&c!==i[ae]&&f.rest.push(c),!a&&f.prefix&&f.iconName){var p=o==="fa"?Js(f.iconName):{},g=Et(f.prefix,f.iconName);p.prefix&&(o=null),f.iconName=p.iconName||g||f.iconName,f.prefix=p.prefix||f.prefix,f.prefix==="far"&&!Lt.far&&Lt.fas&&!M.autoFetchSvg&&(f.prefix="fas")}return f},ei());return(e.includes("fa-brands")||e.includes("fab"))&&(s.prefix="fab"),(e.includes("fa-duotone")||e.includes("fad"))&&(s.prefix="fad"),!s.prefix&&l===ae&&(Lt.fass||M.autoFetchSvg)&&(s.prefix="fass",s.iconName=Et(s.prefix,s.iconName)||s.iconName),(s.prefix==="fa"||o==="fa")&&(s.prefix=ht()||"fas"),s}var Bd=function(){function e(){ed(this,e),this.definitions={}}return td(e,[{key:"add",value:function(){for(var n=this,r=arguments.length,a=new Array(r),i=0;i<r;i++)a[i]=arguments[i];var o=a.reduce(this._pullDefinitions,{});Object.keys(o).forEach(function(l){n.definitions[l]=I(I({},n.definitions[l]||{}),o[l]),ca(l,o[l]);var s=kn[ee][l];s&&ca(s,o[l]),Qs()})}},{key:"reset",value:function(){this.definitions={}}},{key:"_pullDefinitions",value:function(n,r){var a=r.prefix&&r.iconName&&r.icon?{0:r}:r;return Object.keys(a).map(function(i){var o=a[i],l=o.prefix,s=o.iconName,f=o.icon,c=f[2];n[l]||(n[l]={}),c.length>0&&c.forEach(function(d){typeof d=="string"&&(n[l][d]=f)}),n[l][s]=f}),n}}]),e}(),po=[],Ft={},Dt={},Ud=Object.keys(Dt);function Wd(e,t){var n=t.mixoutsTo;return po=e,Ft={},Object.keys(Dt).forEach(function(r){Ud.indexOf(r)===-1&&delete Dt[r]}),po.forEach(function(r){var a=r.mixout?r.mixout():{};if(Object.keys(a).forEach(function(o){typeof a[o]=="function"&&(n[o]=a[o]),lr(a[o])==="object"&&Object.keys(a[o]).forEach(function(l){n[o]||(n[o]={}),n[o][l]=a[o][l]})}),r.hooks){var i=r.hooks();Object.keys(i).forEach(function(o){Ft[o]||(Ft[o]=[]),Ft[o].push(i[o])})}r.provides&&r.provides(Dt)}),n}function fa(e,t){for(var n=arguments.length,r=new Array(n>2?n-2:0),a=2;a<n;a++)r[a-2]=arguments[a];var i=Ft[e]||[];return i.forEach(function(o){t=o.apply(null,[t].concat(r))}),t}function Pt(e){for(var t=arguments.length,n=new Array(t>1?t-1:0),r=1;r<t;r++)n[r-1]=arguments[r];var a=Ft[e]||[];a.forEach(function(i){i.apply(null,n)})}function tt(){var e=arguments[0],t=Array.prototype.slice.call(arguments,1);return Dt[e]?Dt[e].apply(null,t):void 0}function ua(e){e.prefix==="fa"&&(e.prefix="fas");var t=e.iconName,n=e.prefix||ht();if(t)return t=Et(n,t)||t,fo(Zs.definitions,n,t)||fo(Ne.styles,n,t)}var Zs=new Bd,Yd=function(){M.autoReplaceSvg=!1,M.observeMutations=!1,Pt("noAuto")},Kd={i2svg:function(){var t=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{};return rt?(Pt("beforeI2svg",t),tt("pseudoElements2svg",t),tt("i2svg",t)):Promise.reject("Operation requires a DOM of some kind.")},watch:function(){var t=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{},n=t.autoReplaceSvgRoot;M.autoReplaceSvg===!1&&(M.autoReplaceSvg=!0),M.observeMutations=!0,Id(function(){Vd({autoReplaceSvgRoot:n}),Pt("watch",t)})}},qd={icon:function(t){if(t===null)return null;if(lr(t)==="object"&&t.prefix&&t.iconName)return{prefix:t.prefix,iconName:Et(t.prefix,t.iconName)||t.iconName};if(Array.isArray(t)&&t.length===2){var n=t[1].indexOf("fa-")===0?t[1].slice(3):t[1],r=Ar(t[0]);return{prefix:r,iconName:Et(r,n)||n}}if(typeof t=="string"&&(t.indexOf("".concat(M.cssPrefix,"-"))>-1||t.match(md))){var a=Or(t.split(" "),{skipLookups:!0});return{prefix:a.prefix||ht(),iconName:Et(a.prefix,a.iconName)||a.iconName}}if(typeof t=="string"){var i=ht();return{prefix:i,iconName:Et(i,t)||t}}}},Ae={noAuto:Yd,config:M,dom:Kd,parse:qd,library:Zs,findIconDefinition:ua,toHtml:Sn},Vd=function(){var t=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{},n=t.autoReplaceSvgRoot,r=n===void 0?te:n;(Object.keys(Ne.styles).length>0||M.autoFetchSvg)&&rt&&M.autoReplaceSvg&&Ae.dom.i2svg({node:r})};function Pr(e,t){return Object.defineProperty(e,"abstract",{get:t}),Object.defineProperty(e,"html",{get:function(){return e.abstract.map(function(r){return Sn(r)})}}),Object.defineProperty(e,"node",{get:function(){if(rt){var r=te.createElement("div");return r.innerHTML=e.html,r.children}}}),e}function Xd(e){var t=e.children,n=e.main,r=e.mask,a=e.attributes,i=e.styles,o=e.transform;if(Qa(o)&&n.found&&!r.found){var l=n.width,s=n.height,f={x:l/s/2,y:.5};a.style=kr(I(I({},i),{},{"transform-origin":"".concat(f.x+o.x/16,"em ").concat(f.y+o.y/16,"em")}))}return[{tag:"svg",attributes:a,children:t}]}function Gd(e){var t=e.prefix,n=e.iconName,r=e.children,a=e.attributes,i=e.symbol,o=i===!0?"".concat(t,"-").concat(M.cssPrefix,"-").concat(n):i;return[{tag:"svg",attributes:{style:"display: none;"},children:[{tag:"symbol",attributes:I(I({},a),{},{id:o}),children:r}]}]}function ti(e){var t=e.icons,n=t.main,r=t.mask,a=e.prefix,i=e.iconName,o=e.transform,l=e.symbol,s=e.title,f=e.maskId,c=e.titleId,d=e.extra,p=e.watchable,g=p===void 0?!1:p,P=r.found?r:n,C=P.width,F=P.height,x=a==="fak",_=[M.replacementClass,i?"".concat(M.cssPrefix,"-").concat(i):""].filter(function(ve){return d.classes.indexOf(ve)===-1}).filter(function(ve){return ve!==""||!!ve}).concat(d.classes).join(" "),L={children:[],attributes:I(I({},d.attributes),{},{"data-prefix":a,"data-icon":i,class:_,role:d.attributes.role||"img",xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 ".concat(C," ").concat(F)})},S=x&&!~d.classes.indexOf("fa-fw")?{width:"".concat(C/F*16*.0625,"em")}:{};g&&(L.attributes[Ot]=""),s&&(L.children.push({tag:"title",attributes:{id:L.attributes["aria-labelledby"]||"title-".concat(c||On())},children:[s]}),delete L.attributes.title);var U=I(I({},L),{},{prefix:a,iconName:i,main:n,mask:r,maskId:f,transform:o,symbol:l,styles:I(I({},S),d.styles)}),J=r.found&&n.found?tt("generateAbstractMask",U)||{children:[],attributes:{}}:tt("generateAbstractIcon",U)||{children:[],attributes:{}},re=J.children,Ee=J.attributes;return U.children=re,U.attributes=Ee,l?Gd(U):Xd(U)}function ho(e){var t=e.content,n=e.width,r=e.height,a=e.transform,i=e.title,o=e.extra,l=e.watchable,s=l===void 0?!1:l,f=I(I(I({},o.attributes),i?{title:i}:{}),{},{class:o.classes.join(" ")});s&&(f[Ot]="");var c=I({},o.styles);Qa(a)&&(c.transform=Pd({transform:a,startCentered:!0,width:n,height:r}),c["-webkit-transform"]=c.transform);var d=kr(c);d.length>0&&(f.style=d);var p=[];return p.push({tag:"span",attributes:f,children:[t]}),i&&p.push({tag:"span",attributes:{class:"sr-only"},children:[i]}),p}function Qd(e){var t=e.content,n=e.title,r=e.extra,a=I(I(I({},r.attributes),n?{title:n}:{}),{},{class:r.classes.join(" ")}),i=kr(r.styles);i.length>0&&(a.style=i);var o=[];return o.push({tag:"span",attributes:a,children:[t]}),n&&o.push({tag:"span",attributes:{class:"sr-only"},children:[n]}),o}var Dr=Ne.styles;function da(e){var t=e[0],n=e[1],r=e.slice(4),a=Ya(r,1),i=a[0],o=null;return Array.isArray(i)?o={tag:"g",attributes:{class:"".concat(M.cssPrefix,"-").concat(wt.GROUP)},children:[{tag:"path",attributes:{class:"".concat(M.cssPrefix,"-").concat(wt.SECONDARY),fill:"currentColor",d:i[0]}},{tag:"path",attributes:{class:"".concat(M.cssPrefix,"-").concat(wt.PRIMARY),fill:"currentColor",d:i[1]}}]}:o={tag:"path",attributes:{fill:"currentColor",d:i}},{found:!0,width:t,height:n,icon:o}}var Jd={found:!1,width:512,height:512};function Zd(e,t){!$s&&!M.showMissingIcons&&e&&console.error('Icon with name "'.concat(e,'" and prefix "').concat(t,'" is missing.'))}function ma(e,t){var n=t;return t==="fa"&&M.styleDefault!==null&&(t=ht()),new Promise(function(r,a){if(tt("missingIconAbstract"),n==="fa"){var i=Js(e)||{};e=i.iconName||e,t=i.prefix||t}if(e&&t&&Dr[t]&&Dr[t][e]){var o=Dr[t][e];return r(da(o))}Zd(e,t),r(I(I({},Jd),{},{icon:M.showMissingIcons&&e?tt("missingIconAbstract")||{}:{}}))})}var go=function(){},pa=M.measurePerformance&&jn&&jn.mark&&jn.measure?jn:{mark:go,measure:go},an='FA "6.4.2"',em=function(t){return pa.mark("".concat(an," ").concat(t," begins")),function(){return el(t)}},el=function(t){pa.mark("".concat(an," ").concat(t," ends")),pa.measure("".concat(an," ").concat(t),"".concat(an," ").concat(t," begins"),"".concat(an," ").concat(t," ends"))},ni={begin:em,end:el},er=function(){};function vo(e){var t=e.getAttribute?e.getAttribute(Ot):null;return typeof t=="string"}function tm(e){var t=e.getAttribute?e.getAttribute(qa):null,n=e.getAttribute?e.getAttribute(Va):null;return t&&n}function nm(e){return e&&e.classList&&e.classList.contains&&e.classList.contains(M.replacementClass)}function rm(){if(M.autoReplaceSvg===!0)return tr.replace;var e=tr[M.autoReplaceSvg];return e||tr.replace}function am(e){return te.createElementNS("http://www.w3.org/2000/svg",e)}function im(e){return te.createElement(e)}function tl(e){var t=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},n=t.ceFn,r=n===void 0?e.tag==="svg"?am:im:n;if(typeof e=="string")return te.createTextNode(e);var a=r(e.tag);Object.keys(e.attributes||[]).forEach(function(o){a.setAttribute(o,e.attributes[o])});var i=e.children||[];return i.forEach(function(o){a.appendChild(tl(o,{ceFn:r}))}),a}function om(e){var t=" ".concat(e.outerHTML," ");return t="".concat(t,"Font Awesome fontawesome.com "),t}var tr={replace:function(t){var n=t[0];if(n.parentNode)if(t[1].forEach(function(a){n.parentNode.insertBefore(tl(a),n)}),n.getAttribute(Ot)===null&&M.keepOriginalSource){var r=te.createComment(om(n));n.parentNode.replaceChild(r,n)}else n.remove()},nest:function(t){var n=t[0],r=t[1];if(~Ga(n).indexOf(M.replacementClass))return tr.replace(t);var a=new RegExp("".concat(M.cssPrefix,"-.*"));if(delete r[0].attributes.id,r[0].attributes.class){var i=r[0].attributes.class.split(" ").reduce(function(l,s){return s===M.replacementClass||s.match(a)?l.toSvg.push(s):l.toNode.push(s),l},{toNode:[],toSvg:[]});r[0].attributes.class=i.toSvg.join(" "),i.toNode.length===0?n.removeAttribute("class"):n.setAttribute("class",i.toNode.join(" "))}var o=r.map(function(l){return Sn(l)}).join(`
`);n.setAttribute(Ot,""),n.innerHTML=o}};function bo(e){e()}function nl(e,t){var n=typeof t=="function"?t:er;if(e.length===0)n();else{var r=bo;M.mutateApproach===fd&&(r=pt.requestAnimationFrame||bo),r(function(){var a=rm(),i=ni.begin("mutate");e.map(a),i(),n()})}}var ri=!1;function rl(){ri=!0}function ha(){ri=!1}var fr=null;function yo(e){if(so&&M.observeMutations){var t=e.treeCallback,n=t===void 0?er:t,r=e.nodeCallback,a=r===void 0?er:r,i=e.pseudoElementsCallback,o=i===void 0?er:i,l=e.observeMutationsRoot,s=l===void 0?te:l;fr=new so(function(f){if(!ri){var c=ht();Qt(f).forEach(function(d){if(d.type==="childList"&&d.addedNodes.length>0&&!vo(d.addedNodes[0])&&(M.searchPseudoElements&&o(d.target),n(d.target)),d.type==="attributes"&&d.target.parentNode&&M.searchPseudoElements&&o(d.target.parentNode),d.type==="attributes"&&vo(d.target)&&~vd.indexOf(d.attributeName))if(d.attributeName==="class"&&tm(d.target)){var p=Or(Ga(d.target)),g=p.prefix,P=p.iconName;d.target.setAttribute(qa,g||c),P&&d.target.setAttribute(Va,P)}else nm(d.target)&&a(d.target)})}}),rt&&fr.observe(s,{childList:!0,attributes:!0,characterData:!0,subtree:!0})}}function sm(){fr&&fr.disconnect()}function lm(e){var t=e.getAttribute("style"),n=[];return t&&(n=t.split(";").reduce(function(r,a){var i=a.split(":"),o=i[0],l=i.slice(1);return o&&l.length>0&&(r[o]=l.join(":").trim()),r},{})),n}function cm(e){var t=e.getAttribute("data-prefix"),n=e.getAttribute("data-icon"),r=e.innerText!==void 0?e.innerText.trim():"",a=Or(Ga(e));return a.prefix||(a.prefix=ht()),t&&n&&(a.prefix=t,a.iconName=n),a.iconName&&a.prefix||(a.prefix&&r.length>0&&(a.iconName=Dd(a.prefix,e.innerText)||Za(a.prefix,la(e.innerText))),!a.iconName&&M.autoFetchSvg&&e.firstChild&&e.firstChild.nodeType===Node.TEXT_NODE&&(a.iconName=e.firstChild.data)),a}function fm(e){var t=Qt(e.attributes).reduce(function(a,i){return a.name!=="class"&&a.name!=="style"&&(a[i.name]=i.value),a},{}),n=e.getAttribute("title"),r=e.getAttribute("data-fa-title-id");return M.autoA11y&&(n?t["aria-labelledby"]="".concat(M.replacementClass,"-title-").concat(r||On()):(t["aria-hidden"]="true",t.focusable="false")),t}function um(){return{iconName:null,title:null,titleId:null,prefix:null,transform:We,symbol:!1,mask:{iconName:null,prefix:null,rest:[]},maskId:null,extra:{classes:[],styles:{},attributes:{}}}}function xo(e){var t=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{styleParser:!0},n=cm(e),r=n.iconName,a=n.prefix,i=n.rest,o=fm(e),l=fa("parseNodeAttributes",{},e),s=t.styleParser?lm(e):[];return I({iconName:r,title:e.getAttribute("title"),titleId:e.getAttribute("data-fa-title-id"),prefix:a,transform:We,mask:{iconName:null,prefix:null,rest:[]},maskId:null,symbol:!1,extra:{classes:i,styles:s,attributes:o}},l)}var dm=Ne.styles;function al(e){var t=M.autoReplaceSvg==="nest"?xo(e,{styleParser:!1}):xo(e);return~t.extra.classes.indexOf(Ds)?tt("generateLayersText",e,t):tt("generateSvgReplacementMutation",e,t)}var gt=new Set;Xa.map(function(e){gt.add("fa-".concat(e))});Object.keys(wn[ee]).map(gt.add.bind(gt));Object.keys(wn[ae]).map(gt.add.bind(gt));gt=Pn(gt);function _o(e){var t=arguments.length>1&&arguments[1]!==void 0?arguments[1]:null;if(!rt)return Promise.resolve();var n=te.documentElement.classList,r=function(d){return n.add("".concat(lo,"-").concat(d))},a=function(d){return n.remove("".concat(lo,"-").concat(d))},i=M.autoFetchSvg?gt:Xa.map(function(c){return"fa-".concat(c)}).concat(Object.keys(dm));i.includes("fa")||i.push("fa");var o=[".".concat(Ds,":not([").concat(Ot,"])")].concat(i.map(function(c){return".".concat(c,":not([").concat(Ot,"])")})).join(", ");if(o.length===0)return Promise.resolve();var l=[];try{l=Qt(e.querySelectorAll(o))}catch{}if(l.length>0)r("pending"),a("complete");else return Promise.resolve();var s=ni.begin("onTree"),f=l.reduce(function(c,d){try{var p=al(d);p&&c.push(p)}catch(g){$s||g.name==="MissingIcon"&&console.error(g)}return c},[]);return new Promise(function(c,d){Promise.all(f).then(function(p){nl(p,function(){r("active"),r("complete"),a("pending"),typeof t=="function"&&t(),s(),c()})}).catch(function(p){s(),d(p)})})}function mm(e){var t=arguments.length>1&&arguments[1]!==void 0?arguments[1]:null;al(e).then(function(n){n&&nl([n],t)})}function pm(e){return function(t){var n=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},r=(t||{}).icon?t:ua(t||{}),a=n.mask;return a&&(a=(a||{}).icon?a:ua(a||{})),e(r,I(I({},n),{},{mask:a}))}}var hm=function(t){var n=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},r=n.transform,a=r===void 0?We:r,i=n.symbol,o=i===void 0?!1:i,l=n.mask,s=l===void 0?null:l,f=n.maskId,c=f===void 0?null:f,d=n.title,p=d===void 0?null:d,g=n.titleId,P=g===void 0?null:g,C=n.classes,F=C===void 0?[]:C,x=n.attributes,_=x===void 0?{}:x,L=n.styles,S=L===void 0?{}:L;if(t){var U=t.prefix,J=t.iconName,re=t.icon;return Pr(I({type:"icon"},t),function(){return Pt("beforeDOMElementCreation",{iconDefinition:t,params:n}),M.autoA11y&&(p?_["aria-labelledby"]="".concat(M.replacementClass,"-title-").concat(P||On()):(_["aria-hidden"]="true",_.focusable="false")),ti({icons:{main:da(re),mask:s?da(s.icon):{found:!1,width:null,height:null,icon:{}}},prefix:U,iconName:J,transform:I(I({},We),a),symbol:o,title:p,maskId:c,titleId:P,extra:{attributes:_,styles:S,classes:F}})})}},gm={mixout:function(){return{icon:pm(hm)}},hooks:function(){return{mutationObserverCallbacks:function(n){return n.treeCallback=_o,n.nodeCallback=mm,n}}},provides:function(t){t.i2svg=function(n){var r=n.node,a=r===void 0?te:r,i=n.callback,o=i===void 0?function(){}:i;return _o(a,o)},t.generateSvgReplacementMutation=function(n,r){var a=r.iconName,i=r.title,o=r.titleId,l=r.prefix,s=r.transform,f=r.symbol,c=r.mask,d=r.maskId,p=r.extra;return new Promise(function(g,P){Promise.all([ma(a,l),c.iconName?ma(c.iconName,c.prefix):Promise.resolve({found:!1,width:512,height:512,icon:{}})]).then(function(C){var F=Ya(C,2),x=F[0],_=F[1];g([n,ti({icons:{main:x,mask:_},prefix:l,iconName:a,transform:s,symbol:f,maskId:d,title:i,titleId:o,extra:p,watchable:!0})])}).catch(P)})},t.generateAbstractIcon=function(n){var r=n.children,a=n.attributes,i=n.main,o=n.transform,l=n.styles,s=kr(l);s.length>0&&(a.style=s);var f;return Qa(o)&&(f=tt("generateAbstractTransformGrouping",{main:i,transform:o,containerWidth:i.width,iconWidth:i.width})),r.push(f||i.icon),{children:r,attributes:a}}}},vm={mixout:function(){return{layer:function(n){var r=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},a=r.classes,i=a===void 0?[]:a;return Pr({type:"layer"},function(){Pt("beforeDOMElementCreation",{assembler:n,params:r});var o=[];return n(function(l){Array.isArray(l)?l.map(function(s){o=o.concat(s.abstract)}):o=o.concat(l.abstract)}),[{tag:"span",attributes:{class:["".concat(M.cssPrefix,"-layers")].concat(Pn(i)).join(" ")},children:o}]})}}}},bm={mixout:function(){return{counter:function(n){var r=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},a=r.title,i=a===void 0?null:a,o=r.classes,l=o===void 0?[]:o,s=r.attributes,f=s===void 0?{}:s,c=r.styles,d=c===void 0?{}:c;return Pr({type:"counter",content:n},function(){return Pt("beforeDOMElementCreation",{content:n,params:r}),Qd({content:n.toString(),title:i,extra:{attributes:f,styles:d,classes:["".concat(M.cssPrefix,"-layers-counter")].concat(Pn(l))}})})}}}},ym={mixout:function(){return{text:function(n){var r=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},a=r.transform,i=a===void 0?We:a,o=r.title,l=o===void 0?null:o,s=r.classes,f=s===void 0?[]:s,c=r.attributes,d=c===void 0?{}:c,p=r.styles,g=p===void 0?{}:p;return Pr({type:"text",content:n},function(){return Pt("beforeDOMElementCreation",{content:n,params:r}),ho({content:n,transform:I(I({},We),i),title:l,extra:{attributes:d,styles:g,classes:["".concat(M.cssPrefix,"-layers-text")].concat(Pn(f))}})})}}},provides:function(t){t.generateLayersText=function(n,r){var a=r.title,i=r.transform,o=r.extra,l=null,s=null;if(Fs){var f=parseInt(getComputedStyle(n).fontSize,10),c=n.getBoundingClientRect();l=c.width/f,s=c.height/f}return M.autoA11y&&!a&&(o.attributes["aria-hidden"]="true"),Promise.resolve([n,ho({content:n.innerHTML,width:l,height:s,transform:i,title:a,extra:o,watchable:!0})])}}},xm=new RegExp('"',"ug"),wo=[1105920,1112319];function _m(e){var t=e.replace(xm,""),n=Md(t,0),r=n>=wo[0]&&n<=wo[1],a=t.length===2?t[0]===t[1]:!1;return{value:la(a?t[0]:t),isSecondary:r||a}}function Eo(e,t){var n="".concat(cd).concat(t.replace(":","-"));return new Promise(function(r,a){if(e.getAttribute(n)!==null)return r();var i=Qt(e.children),o=i.filter(function(re){return re.getAttribute(sa)===t})[0],l=pt.getComputedStyle(e,t),s=l.getPropertyValue("font-family").match(pd),f=l.getPropertyValue("font-weight"),c=l.getPropertyValue("content");if(o&&!s)return e.removeChild(o),r();if(s&&c!=="none"&&c!==""){var d=l.getPropertyValue("content"),p=~["Sharp"].indexOf(s[2])?ae:ee,g=~["Solid","Regular","Light","Thin","Duotone","Brands","Kit"].indexOf(s[2])?En[p][s[2].toLowerCase()]:hd[p][f],P=_m(d),C=P.value,F=P.isSecondary,x=s[0].startsWith("FontAwesome"),_=Za(g,C),L=_;if(x){var S=Hd(C);S.iconName&&S.prefix&&(_=S.iconName,g=S.prefix)}if(_&&!F&&(!o||o.getAttribute(qa)!==g||o.getAttribute(Va)!==L)){e.setAttribute(n,L),o&&e.removeChild(o);var U=um(),J=U.extra;J.attributes[sa]=t,ma(_,g).then(function(re){var Ee=ti(I(I({},U),{},{icons:{main:re,mask:ei()},prefix:g,iconName:L,extra:J,watchable:!0})),ve=te.createElementNS("http://www.w3.org/2000/svg","svg");t==="::before"?e.insertBefore(ve,e.firstChild):e.appendChild(ve),ve.outerHTML=Ee.map(function(Oe){return Sn(Oe)}).join(`
`),e.removeAttribute(n),r()}).catch(a)}else r()}else r()})}function wm(e){return Promise.all([Eo(e,"::before"),Eo(e,"::after")])}function Em(e){return e.parentNode!==document.head&&!~ud.indexOf(e.tagName.toUpperCase())&&!e.getAttribute(sa)&&(!e.parentNode||e.parentNode.tagName!=="svg")}function ko(e){if(rt)return new Promise(function(t,n){var r=Qt(e.querySelectorAll("*")).filter(Em).map(wm),a=ni.begin("searchPseudoElements");rl(),Promise.all(r).then(function(){a(),ha(),t()}).catch(function(){a(),ha(),n()})})}var km={hooks:function(){return{mutationObserverCallbacks:function(n){return n.pseudoElementsCallback=ko,n}}},provides:function(t){t.pseudoElements2svg=function(n){var r=n.node,a=r===void 0?te:r;M.searchPseudoElements&&ko(a)}}},Ao=!1,Am={mixout:function(){return{dom:{unwatch:function(){rl(),Ao=!0}}}},hooks:function(){return{bootstrap:function(){yo(fa("mutationObserverCallbacks",{}))},noAuto:function(){sm()},watch:function(n){var r=n.observeMutationsRoot;Ao?ha():yo(fa("mutationObserverCallbacks",{observeMutationsRoot:r}))}}}},Oo=function(t){var n={size:16,x:0,y:0,flipX:!1,flipY:!1,rotate:0};return t.toLowerCase().split(" ").reduce(function(r,a){var i=a.toLowerCase().split("-"),o=i[0],l=i.slice(1).join("-");if(o&&l==="h")return r.flipX=!0,r;if(o&&l==="v")return r.flipY=!0,r;if(l=parseFloat(l),isNaN(l))return r;switch(o){case"grow":r.size=r.size+l;break;case"shrink":r.size=r.size-l;break;case"left":r.x=r.x-l;break;case"right":r.x=r.x+l;break;case"up":r.y=r.y-l;break;case"down":r.y=r.y+l;break;case"rotate":r.rotate=r.rotate+l;break}return r},n)},Om={mixout:function(){return{parse:{transform:function(n){return Oo(n)}}}},hooks:function(){return{parseNodeAttributes:function(n,r){var a=r.getAttribute("data-fa-transform");return a&&(n.transform=Oo(a)),n}}},provides:function(t){t.generateAbstractTransformGrouping=function(n){var r=n.main,a=n.transform,i=n.containerWidth,o=n.iconWidth,l={transform:"translate(".concat(i/2," 256)")},s="translate(".concat(a.x*32,", ").concat(a.y*32,") "),f="scale(".concat(a.size/16*(a.flipX?-1:1),", ").concat(a.size/16*(a.flipY?-1:1),") "),c="rotate(".concat(a.rotate," 0 0)"),d={transform:"".concat(s," ").concat(f," ").concat(c)},p={transform:"translate(".concat(o/2*-1," -256)")},g={outer:l,inner:d,path:p};return{tag:"g",attributes:I({},g.outer),children:[{tag:"g",attributes:I({},g.inner),children:[{tag:r.icon.tag,children:r.icon.children,attributes:I(I({},r.icon.attributes),g.path)}]}]}}}},Hr={x:0,y:0,width:"100%",height:"100%"};function Po(e){var t=arguments.length>1&&arguments[1]!==void 0?arguments[1]:!0;return e.attributes&&(e.attributes.fill||t)&&(e.attributes.fill="black"),e}function Pm(e){return e.tag==="g"?e.children:[e]}var Cm={hooks:function(){return{parseNodeAttributes:function(n,r){var a=r.getAttribute("data-fa-mask"),i=a?Or(a.split(" ").map(function(o){return o.trim()})):ei();return i.prefix||(i.prefix=ht()),n.mask=i,n.maskId=r.getAttribute("data-fa-mask-id"),n}}},provides:function(t){t.generateAbstractMask=function(n){var r=n.children,a=n.attributes,i=n.main,o=n.mask,l=n.maskId,s=n.transform,f=i.width,c=i.icon,d=o.width,p=o.icon,g=Od({transform:s,containerWidth:d,iconWidth:f}),P={tag:"rect",attributes:I(I({},Hr),{},{fill:"white"})},C=c.children?{children:c.children.map(Po)}:{},F={tag:"g",attributes:I({},g.inner),children:[Po(I({tag:c.tag,attributes:I(I({},c.attributes),g.path)},C))]},x={tag:"g",attributes:I({},g.outer),children:[F]},_="mask-".concat(l||On()),L="clip-".concat(l||On()),S={tag:"mask",attributes:I(I({},Hr),{},{id:_,maskUnits:"userSpaceOnUse",maskContentUnits:"userSpaceOnUse"}),children:[P,x]},U={tag:"defs",children:[{tag:"clipPath",attributes:{id:L},children:Pm(p)},S]};return r.push(U,{tag:"rect",attributes:I({fill:"currentColor","clip-path":"url(#".concat(L,")"),mask:"url(#".concat(_,")")},Hr)}),{children:r,attributes:a}}}},Sm={provides:function(t){var n=!1;pt.matchMedia&&(n=pt.matchMedia("(prefers-reduced-motion: reduce)").matches),t.missingIconAbstract=function(){var r=[],a={fill:"currentColor"},i={attributeType:"XML",repeatCount:"indefinite",dur:"2s"};r.push({tag:"path",attributes:I(I({},a),{},{d:"M156.5,447.7l-12.6,29.5c-18.7-9.5-35.9-21.2-51.5-34.9l22.7-22.7C127.6,430.5,141.5,440,156.5,447.7z M40.6,272H8.5 c1.4,21.2,5.4,41.7,11.7,61.1L50,321.2C45.1,305.5,41.8,289,40.6,272z M40.6,240c1.4-18.8,5.2-37,11.1-54.1l-29.5-12.6 C14.7,194.3,10,216.7,8.5,240H40.6z M64.3,156.5c7.8-14.9,17.2-28.8,28.1-41.5L69.7,92.3c-13.7,15.6-25.5,32.8-34.9,51.5 L64.3,156.5z M397,419.6c-13.9,12-29.4,22.3-46.1,30.4l11.9,29.8c20.7-9.9,39.8-22.6,56.9-37.6L397,419.6z M115,92.4 c13.9-12,29.4-22.3,46.1-30.4l-11.9-29.8c-20.7,9.9-39.8,22.6-56.8,37.6L115,92.4z M447.7,355.5c-7.8,14.9-17.2,28.8-28.1,41.5 l22.7,22.7c13.7-15.6,25.5-32.9,34.9-51.5L447.7,355.5z M471.4,272c-1.4,18.8-5.2,37-11.1,54.1l29.5,12.6 c7.5-21.1,12.2-43.5,13.6-66.8H471.4z M321.2,462c-15.7,5-32.2,8.2-49.2,9.4v32.1c21.2-1.4,41.7-5.4,61.1-11.7L321.2,462z M240,471.4c-18.8-1.4-37-5.2-54.1-11.1l-12.6,29.5c21.1,7.5,43.5,12.2,66.8,13.6V471.4z M462,190.8c5,15.7,8.2,32.2,9.4,49.2h32.1 c-1.4-21.2-5.4-41.7-11.7-61.1L462,190.8z M92.4,397c-12-13.9-22.3-29.4-30.4-46.1l-29.8,11.9c9.9,20.7,22.6,39.8,37.6,56.9 L92.4,397z M272,40.6c18.8,1.4,36.9,5.2,54.1,11.1l12.6-29.5C317.7,14.7,295.3,10,272,8.5V40.6z M190.8,50 c15.7-5,32.2-8.2,49.2-9.4V8.5c-21.2,1.4-41.7,5.4-61.1,11.7L190.8,50z M442.3,92.3L419.6,115c12,13.9,22.3,29.4,30.5,46.1 l29.8-11.9C470,128.5,457.3,109.4,442.3,92.3z M397,92.4l22.7-22.7c-15.6-13.7-32.8-25.5-51.5-34.9l-12.6,29.5 C370.4,72.1,384.4,81.5,397,92.4z"})});var o=I(I({},i),{},{attributeName:"opacity"}),l={tag:"circle",attributes:I(I({},a),{},{cx:"256",cy:"364",r:"28"}),children:[]};return n||l.children.push({tag:"animate",attributes:I(I({},i),{},{attributeName:"r",values:"28;14;28;28;14;28;"})},{tag:"animate",attributes:I(I({},o),{},{values:"1;0;1;1;0;1;"})}),r.push(l),r.push({tag:"path",attributes:I(I({},a),{},{opacity:"1",d:"M263.7,312h-16c-6.6,0-12-5.4-12-12c0-71,77.4-63.9,77.4-107.8c0-20-17.8-40.2-57.4-40.2c-29.1,0-44.3,9.6-59.2,28.7 c-3.9,5-11.1,6-16.2,2.4l-13.1-9.2c-5.6-3.9-6.9-11.8-2.6-17.2c21.2-27.2,46.4-44.7,91.2-44.7c52.3,0,97.4,29.8,97.4,80.2 c0,67.6-77.4,63.5-77.4,107.8C275.7,306.6,270.3,312,263.7,312z"}),children:n?[]:[{tag:"animate",attributes:I(I({},o),{},{values:"1;0;0;0;0;1;"})}]}),n||r.push({tag:"path",attributes:I(I({},a),{},{opacity:"0",d:"M232.5,134.5l7,168c0.3,6.4,5.6,11.5,12,11.5h9c6.4,0,11.7-5.1,12-11.5l7-168c0.3-6.8-5.2-12.5-12-12.5h-23 C237.7,122,232.2,127.7,232.5,134.5z"}),children:[{tag:"animate",attributes:I(I({},o),{},{values:"0;0;1;1;0;0;"})}]}),{tag:"g",attributes:{class:"missing"},children:r}}}},Rm={hooks:function(){return{parseNodeAttributes:function(n,r){var a=r.getAttribute("data-fa-symbol"),i=a===null?!1:a===""?!0:a;return n.symbol=i,n}}}},Im=[Sd,gm,vm,bm,ym,km,Am,Om,Cm,Sm,Rm];Wd(Im,{mixoutsTo:Ae});Ae.noAuto;Ae.config;var Tm=Ae.library;Ae.dom;var ga=Ae.parse;Ae.findIconDefinition;Ae.toHtml;var Nm=Ae.icon;Ae.layer;Ae.text;Ae.counter;function Co(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter(function(a){return Object.getOwnPropertyDescriptor(e,a).enumerable})),n.push.apply(n,r)}return n}function Xe(e){for(var t=1;t<arguments.length;t++){var n=arguments[t]!=null?arguments[t]:{};t%2?Co(Object(n),!0).forEach(function(r){xe(e,r,n[r])}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):Co(Object(n)).forEach(function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(n,r))})}return e}function ur(e){"@babel/helpers - typeof";return ur=typeof Symbol=="function"&&typeof Symbol.iterator=="symbol"?function(t){return typeof t}:function(t){return t&&typeof Symbol=="function"&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},ur(e)}function xe(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function Mm(e,t){if(e==null)return{};var n={},r=Object.keys(e),a,i;for(i=0;i<r.length;i++)a=r[i],!(t.indexOf(a)>=0)&&(n[a]=e[a]);return n}function Lm(e,t){if(e==null)return{};var n=Mm(e,t),r,a;if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(a=0;a<i.length;a++)r=i[a],!(t.indexOf(r)>=0)&&Object.prototype.propertyIsEnumerable.call(e,r)&&(n[r]=e[r])}return n}var Fm=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{},il={exports:{}};(function(e){(function(t){var n=function(x,_,L){if(!f(_)||d(_)||p(_)||g(_)||s(_))return _;var S,U=0,J=0;if(c(_))for(S=[],J=_.length;U<J;U++)S.push(n(x,_[U],L));else{S={};for(var re in _)Object.prototype.hasOwnProperty.call(_,re)&&(S[x(re,L)]=n(x,_[re],L))}return S},r=function(x,_){_=_||{};var L=_.separator||"_",S=_.split||/(?=[A-Z])/;return x.split(S).join(L)},a=function(x){return P(x)?x:(x=x.replace(/[\-_\s]+(.)?/g,function(_,L){return L?L.toUpperCase():""}),x.substr(0,1).toLowerCase()+x.substr(1))},i=function(x){var _=a(x);return _.substr(0,1).toUpperCase()+_.substr(1)},o=function(x,_){return r(x,_).toLowerCase()},l=Object.prototype.toString,s=function(x){return typeof x=="function"},f=function(x){return x===Object(x)},c=function(x){return l.call(x)=="[object Array]"},d=function(x){return l.call(x)=="[object Date]"},p=function(x){return l.call(x)=="[object RegExp]"},g=function(x){return l.call(x)=="[object Boolean]"},P=function(x){return x=x-0,x===x},C=function(x,_){var L=_&&"process"in _?_.process:_;return typeof L!="function"?x:function(S,U){return L(S,x,U)}},F={camelize:a,decamelize:o,pascalize:i,depascalize:o,camelizeKeys:function(x,_){return n(C(a,_),x)},decamelizeKeys:function(x,_){return n(C(o,_),x,_)},pascalizeKeys:function(x,_){return n(C(i,_),x)},depascalizeKeys:function(){return this.decamelizeKeys.apply(this,arguments)}};e.exports?e.exports=F:t.humps=F})(Fm)})(il);var jm=il.exports,zm=["class","style"];function $m(e){return e.split(";").map(function(t){return t.trim()}).filter(function(t){return t}).reduce(function(t,n){var r=n.indexOf(":"),a=jm.camelize(n.slice(0,r)),i=n.slice(r+1).trim();return t[a]=i,t},{})}function Dm(e){return e.split(/\s+/).reduce(function(t,n){return t[n]=!0,t},{})}function ol(e){var t=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},n=arguments.length>2&&arguments[2]!==void 0?arguments[2]:{};if(typeof e=="string")return e;var r=(e.children||[]).map(function(s){return ol(s)}),a=Object.keys(e.attributes||{}).reduce(function(s,f){var c=e.attributes[f];switch(f){case"class":s.class=Dm(c);break;case"style":s.style=$m(c);break;default:s.attrs[f]=c}return s},{attrs:{},class:{},style:{}});n.class;var i=n.style,o=i===void 0?{}:i,l=Lm(n,zm);return Ha(e.tag,Xe(Xe(Xe({},t),{},{class:a.class,style:Xe(Xe({},a.style),o)},a.attrs),l),r)}var sl=!1;try{sl=!0}catch{}function Hm(){if(!sl&&console&&typeof console.error=="function"){var e;(e=console).error.apply(e,arguments)}}function Br(e,t){return Array.isArray(t)&&t.length>0||!Array.isArray(t)&&t?xe({},e,t):{}}function Bm(e){var t,n=(t={"fa-spin":e.spin,"fa-pulse":e.pulse,"fa-fw":e.fixedWidth,"fa-border":e.border,"fa-li":e.listItem,"fa-inverse":e.inverse,"fa-flip":e.flip===!0,"fa-flip-horizontal":e.flip==="horizontal"||e.flip==="both","fa-flip-vertical":e.flip==="vertical"||e.flip==="both"},xe(t,"fa-".concat(e.size),e.size!==null),xe(t,"fa-rotate-".concat(e.rotation),e.rotation!==null),xe(t,"fa-pull-".concat(e.pull),e.pull!==null),xe(t,"fa-swap-opacity",e.swapOpacity),xe(t,"fa-bounce",e.bounce),xe(t,"fa-shake",e.shake),xe(t,"fa-beat",e.beat),xe(t,"fa-fade",e.fade),xe(t,"fa-beat-fade",e.beatFade),xe(t,"fa-flash",e.flash),xe(t,"fa-spin-pulse",e.spinPulse),xe(t,"fa-spin-reverse",e.spinReverse),t);return Object.keys(n).map(function(r){return n[r]?r:null}).filter(function(r){return r})}function So(e){if(e&&ur(e)==="object"&&e.prefix&&e.iconName&&e.icon)return e;if(ga.icon)return ga.icon(e);if(e===null)return null;if(ur(e)==="object"&&e.prefix&&e.iconName)return e;if(Array.isArray(e)&&e.length===2)return{prefix:e[0],iconName:e[1]};if(typeof e=="string")return{prefix:"fas",iconName:e}}var Um=Gt({name:"FontAwesomeIcon",props:{border:{type:Boolean,default:!1},fixedWidth:{type:Boolean,default:!1},flip:{type:[Boolean,String],default:!1,validator:function(t){return[!0,!1,"horizontal","vertical","both"].indexOf(t)>-1}},icon:{type:[Object,Array,String],required:!0},mask:{type:[Object,Array,String],default:null},listItem:{type:Boolean,default:!1},pull:{type:String,default:null,validator:function(t){return["right","left"].indexOf(t)>-1}},pulse:{type:Boolean,default:!1},rotation:{type:[String,Number],default:null,validator:function(t){return[90,180,270].indexOf(Number.parseInt(t,10))>-1}},swapOpacity:{type:Boolean,default:!1},size:{type:String,default:null,validator:function(t){return["2xs","xs","sm","lg","xl","2xl","1x","2x","3x","4x","5x","6x","7x","8x","9x","10x"].indexOf(t)>-1}},spin:{type:Boolean,default:!1},transform:{type:[String,Object],default:null},symbol:{type:[Boolean,String],default:!1},title:{type:String,default:null},inverse:{type:Boolean,default:!1},bounce:{type:Boolean,default:!1},shake:{type:Boolean,default:!1},beat:{type:Boolean,default:!1},fade:{type:Boolean,default:!1},beatFade:{type:Boolean,default:!1},flash:{type:Boolean,default:!1},spinPulse:{type:Boolean,default:!1},spinReverse:{type:Boolean,default:!1}},setup:function(t,n){var r=n.attrs,a=ue(function(){return So(t.icon)}),i=ue(function(){return Br("classes",Bm(t))}),o=ue(function(){return Br("transform",typeof t.transform=="string"?ga.transform(t.transform):t.transform)}),l=ue(function(){return Br("mask",So(t.mask))}),s=ue(function(){return Nm(a.value,Xe(Xe(Xe(Xe({},i.value),o.value),l.value),{},{symbol:t.symbol,title:t.title}))});sn(s,function(c){if(!c)return Hm("Could not find one or more icon(s)",a.value,l.value)},{immediate:!0});var f=ue(function(){return s.value?ol(s.value.abstract[0],{},r):null});return function(){return f.value}}}),Wm={prefix:"fas",iconName:"image",icon:[512,512,[],"f03e","M0 96C0 60.7 28.7 32 64 32H448c35.3 0 64 28.7 64 64V416c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V96zM323.8 202.5c-4.5-6.6-11.9-10.5-19.8-10.5s-15.4 3.9-19.8 10.5l-87 127.6L170.7 297c-4.6-5.7-11.5-9-18.7-9s-14.2 3.3-18.7 9l-64 80c-5.8 7.2-6.9 17.1-2.9 25.4s12.4 13.6 21.6 13.6h96 32H424c8.9 0 17.1-4.9 21.2-12.8s3.6-17.4-1.4-24.7l-120-176zM112 192a48 48 0 1 0 0-96 48 48 0 1 0 0 96z"]},Ym={prefix:"fas",iconName:"circle-question",icon:[512,512,[62108,"question-circle"],"f059","M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM169.8 165.3c7.9-22.3 29.1-37.3 52.8-37.3h58.3c34.9 0 63.1 28.3 63.1 63.1c0 22.6-12.1 43.5-31.7 54.8L280 264.4c-.2 13-10.9 23.6-24 23.6c-13.3 0-24-10.7-24-24V250.5c0-8.6 4.6-16.5 12.1-20.8l44.3-25.4c4.7-2.7 7.6-7.7 7.6-13.1c0-8.4-6.8-15.1-15.1-15.1H222.6c-3.4 0-6.4 2.1-7.5 5.3l-.4 1.2c-4.4 12.5-18.2 19-30.6 14.6s-19-18.2-14.6-30.6l.4-1.2zM224 352a32 32 0 1 1 64 0 32 32 0 1 1 -64 0z"]},Km={prefix:"fas",iconName:"camera",icon:[512,512,[62258,"camera-alt"],"f030","M149.1 64.8L138.7 96H64C28.7 96 0 124.7 0 160V416c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V160c0-35.3-28.7-64-64-64H373.3L362.9 64.8C356.4 45.2 338.1 32 317.4 32H194.6c-20.7 0-39 13.2-45.5 32.8zM256 192a96 96 0 1 1 0 192 96 96 0 1 1 0-192z"]},qm={prefix:"fas",iconName:"gear",icon:[512,512,[9881,"cog"],"f013","M495.9 166.6c3.2 8.7 .5 18.4-6.4 24.6l-43.3 39.4c1.1 8.3 1.7 16.8 1.7 25.4s-.6 17.1-1.7 25.4l43.3 39.4c6.9 6.2 9.6 15.9 6.4 24.6c-4.4 11.9-9.7 23.3-15.8 34.3l-4.7 8.1c-6.6 11-14 21.4-22.1 31.2c-5.9 7.2-15.7 9.6-24.5 6.8l-55.7-17.7c-13.4 10.3-28.2 18.9-44 25.4l-12.5 57.1c-2 9.1-9 16.3-18.2 17.8c-13.8 2.3-28 3.5-42.5 3.5s-28.7-1.2-42.5-3.5c-9.2-1.5-16.2-8.7-18.2-17.8l-12.5-57.1c-15.8-6.5-30.6-15.1-44-25.4L83.1 425.9c-8.8 2.8-18.6 .3-24.5-6.8c-8.1-9.8-15.5-20.2-22.1-31.2l-4.7-8.1c-6.1-11-11.4-22.4-15.8-34.3c-3.2-8.7-.5-18.4 6.4-24.6l43.3-39.4C64.6 273.1 64 264.6 64 256s.6-17.1 1.7-25.4L22.4 191.2c-6.9-6.2-9.6-15.9-6.4-24.6c4.4-11.9 9.7-23.3 15.8-34.3l4.7-8.1c6.6-11 14-21.4 22.1-31.2c5.9-7.2 15.7-9.6 24.5-6.8l55.7 17.7c13.4-10.3 28.2-18.9 44-25.4l12.5-57.1c2-9.1 9-16.3 18.2-17.8C227.3 1.2 241.5 0 256 0s28.7 1.2 42.5 3.5c9.2 1.5 16.2 8.7 18.2 17.8l12.5 57.1c15.8 6.5 30.6 15.1 44 25.4l55.7-17.7c8.8-2.8 18.6-.3 24.5 6.8c8.1 9.8 15.5 20.2 22.1 31.2l4.7 8.1c6.1 11 11.4 22.4 15.8 34.3zM256 336a80 80 0 1 0 0-160 80 80 0 1 0 0 160z"]},Vm={prefix:"fas",iconName:"magnifying-glass",icon:[512,512,[128269,"search"],"f002","M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"]},Xm={prefix:"fas",iconName:"paper-plane",icon:[512,512,[61913],"f1d8","M498.1 5.6c10.1 7 15.4 19.1 13.5 31.2l-64 416c-1.5 9.7-7.4 18.2-16 23s-18.9 5.4-28 1.6L284 427.7l-68.5 74.1c-8.9 9.7-22.9 12.9-35.2 8.1S160 493.2 160 480V396.4c0-4 1.5-7.8 4.2-10.7L331.8 202.8c5.8-6.3 5.6-16-.4-22s-15.7-6.4-22-.7L106 360.8 17.7 316.6C7.1 311.3 .3 300.7 0 288.9s5.9-22.8 16.1-28.7l448-256c10.7-6.1 23.9-5.5 34 1.4z"]};const Gm={class:"navbar navbar-expand-lg bg-body-tertiary"},Qm={class:"container-fluid"},Jm=Se("a",{class:"navbar-brand",href:"#"},"Navbar",-1),Zm=Se("button",{class:"navbar-toggler",type:"button","data-bs-toggle":"collapse","data-bs-target":"#navbarSupportedContent","aria-controls":"navbarSupportedContent","aria-expanded":"false","aria-label":"Toggle navigation"},[Se("span",{class:"navbar-toggler-icon"})],-1),ep={class:"collapse navbar-collapse",id:"navbarSupportedContent"},tp={class:"navbar-nav me-auto mb-2 mb-lg-0"},np={class:"nav-item"},rp={class:"nav-item"},ap={class:"nav-item"},ip=Gt({__name:"NavbarComponent",setup(e){return(t,n)=>(Fa(),ja("nav",Gm,[Se("div",Qm,[Jm,Zm,Se("div",ep,[Se("ul",tp,[Se("li",np,[se(Ge(Zn),{class:"nav-link active","aria-current":"page",to:"/"},{default:qn(()=>[Jn("Home")]),_:1})]),Se("li",rp,[se(Ge(Zn),{class:"nav-link",to:"chat"},{default:qn(()=>[Jn("Chat")]),_:1})]),Se("li",ap,[se(Ge(Zn),{class:"nav-link",to:"About"},{default:qn(()=>[Jn("About")]),_:1})])])])])]))}}),op=Gt({__name:"App",setup(e){return(t,n)=>{const r=Sc("RouterView");return Fa(),ja(He,null,[se(ip),se(r)],64)}}});Tm.add(Xm,Vm,Ym,qm,Wm,Km);const sp=Zu(),Cr=Tf(op);Cr.use(sp);Cr.use(Gu);Cr.component("font-awesome-icon",Um);Cr.mount("#app");export{Wa as _,Se as a,se as b,ja as c,lp as d,Fa as o,Sc as r};
