!function(t){var e={};function r(o){if(e[o])return e[o].exports;var n=e[o]={i:o,l:!1,exports:{}};return t[o].call(n.exports,n,n.exports,r),n.l=!0,n.exports}r.m=t,r.c=e,r.d=function(t,e,o){r.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:o})},r.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},r.t=function(t,e){if(1&e&&(t=r(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var o=Object.create(null);if(r.r(o),Object.defineProperty(o,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var n in t)r.d(o,n,function(e){return t[e]}.bind(null,n));return o},r.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return r.d(e,"a",e),e},r.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},r.p="",r(r.s=4)}([function(t,e,r){"use strict";const o=r(1);t.exports=class{constructor(){this.camera={x:0,y:0},this.trees=[],this.area={},this.width=document.body.offsetWidth,this.height=document.body.offsetHeight,this.initKeyboard(),this.initCanvas(),this.initDrawer(),this.hasChange=!0,setInterval(()=>{this.main()},30)}main(){let{camera:t,keyCodes:e}=this,r=0,o=1;if(e.up&&(o=1),e.down&&(o=-1),e.left&&(r=-1),e.right&&(r=1),0!=r||0!=o){let e=Math.sqrt(r*r+o*o),n=t.x+10*r/e,i=t.y+10*o/e;this.trees.some(t=>{let e=n-t.x,r=i-t.y;return Math.sqrt(e*e+r*r)<25})||(t.x=n,t.y=i)}this.generateArea(),this.draw()}initCanvas(){const t=document.createElement("canvas");t.style.position="fixed",t.style.width="100%",t.style.height="100%",document.body.appendChild(t),this.canvas=t}initDrawer(){this.drawer=new o(this.canvas)}initKeyboard(){let t={up:!1,down:!1,left:!1,right:!1};this.keyCodes=t,document.onkeyup=(e=>{37==e.keyCode&&(t.left=!1),38==e.keyCode&&(t.up=!1),39==e.keyCode&&(t.right=!1),40==e.keyCode&&(t.down=!1)}),document.onkeydown=(e=>{37==e.keyCode&&(t.left=!0),38==e.keyCode&&(t.up=!0),39==e.keyCode&&(t.right=!0),40==e.keyCode&&(t.down=!0)})}draw(){this.drawer.draw(this)}generateArea(){this.trees=[];let{camera:t,width:e,height:r,area:o}=this;for(let n=t.x-e/2;n<t.x+e/2;n+=150)for(let e=t.y-r/2;e<t.y+r/2;e+=150){let t=n-n%150,r=e-e%150,i=t+":"+r,a=o[i];0==t&&0==r||(a||(a={x:t+150*Math.random(),y:r+150*Math.random()},o[i]=a),this.trees.push(a))}}}},function(t,e,r){"use strict";const o=r(2),n=r(3);t.exports=class{constructor(t){let e=t.getContext("webgl");this.gl=e,this.canvas=t,this.vertexShader=o.createShader(e,e.VERTEX_SHADER,"\n            attribute vec4 a_position;\n            attribute vec3 a_normal;\n            \n            uniform vec3 u_lightWorldPosition;\n            \n            uniform mat4 u_world;\n            uniform mat4 u_worldViewProjection;\n            uniform mat4 u_worldInverseTranspose;\n            \n            varying vec3 v_normal;\n            \n            varying vec3 v_surfaceToLight;\n            \n            void main() {\n                // Multiply the position by the matrix.\n                gl_Position = u_worldViewProjection * a_position;\n                \n                // orient the normals and pass to the fragment shader\n                v_normal = mat3(u_worldInverseTranspose) * a_normal;\n                \n                // compute the world position of the surfoace\n                vec3 surfaceWorldPosition = (u_world * a_position).xyz;\n                \n                // compute the vector of the surface to the light\n                // and pass it to the fragment shader\n                v_surfaceToLight = u_lightWorldPosition - surfaceWorldPosition;\n            }\n        "),this.fragmentShader=o.createShader(e,e.FRAGMENT_SHADER,"\n            precision mediump float;\n\n            // Passed in from the vertex shader.\n            varying vec3 v_normal;\n            varying vec3 v_surfaceToLight;\n            \n            uniform vec4 u_color;\n            \n            void main() {\n                // because v_normal is a varying it's interpolated\n                // we it will not be a uint vector. Normalizing it\n                // will make it a unit vector again\n                vec3 normal = normalize(v_normal);\n                \n                vec3 surfaceToLightDirection = normalize(v_surfaceToLight);\n                \n                float light = dot(normal, surfaceToLightDirection);\n                \n                gl_FragColor = u_color;\n                \n                // Lets multiply just the color portion (not the alpha)\n                // by the light\n                gl_FragColor.rgb *= light;\n            }\n        ");let r=o.createProgram(e,this.vertexShader,this.fragmentShader);this.program=r,this.positionLocation=e.getAttribLocation(r,"a_position"),this.normalLocation=e.getAttribLocation(r,"a_normal"),this.colorLocation=e.getUniformLocation(r,"u_color"),this.worldViewProjectionLocation=e.getUniformLocation(r,"u_worldViewProjection"),this.worldInverseTransposeLocation=e.getUniformLocation(r,"u_worldInverseTranspose"),this.lightWorldPositionLocation=e.getUniformLocation(r,"u_lightWorldPosition"),this.worldLocation=e.getUniformLocation(r,"u_world");let i=n();this.treeInfo=i,this.positionBuffer=e.createBuffer(),this.normalBuffer=e.createBuffer()}draw({camera:t,trees:e,width:r,height:n}){let i,a,s,l,u,{canvas:c,gl:h,positionLocation:f,program:d,colorLocation:m,normalLocation:p,worldViewProjectionLocation:y,worldInverseTransposeLocation:v,lightWorldPositionLocation:g,worldLocation:w,positionBuffer:_,normalBuffer:A,treeInfo:b}=this;c.width=r,c.height=n,h.viewport(0,0,r,n),h.clear(h.COLOR_BUFFER_BIT|h.DEPTH_BUFFER_BIT),h.enable(h.CULL_FACE),h.enable(h.DEPTH_TEST),h.useProgram(d),h.enableVertexAttribArray(f),h.bindBuffer(h.ARRAY_BUFFER,_),i=3,a=h.FLOAT,s=!1,l=0,u=0,h.vertexAttribPointer(f,i,a,s,l,u),h.enableVertexAttribArray(p),h.bindBuffer(h.ARRAY_BUFFER,A),i=3,a=h.FLOAT,s=!1,l=0,u=0,h.vertexAttribPointer(p,i,a,s,l,u);let R=r/n,F=o.perspective(60*Math.PI/180,R,1,2e3),x=o.translation(t.x,t.y,400),L=o.inverse(x),T=o.multiply(F,L);h.uniform4fv(m,[81/256,107/256,130/256,1]);const P=[t.x,t.y,-230];h.uniform3fv(g,P);let M=o.translation(t.x,t.y,0),B=o.multiply(T,M),S=o.inverse(M),E=o.transpose(S);h.uniformMatrix4fv(y,!1,B),h.uniformMatrix4fv(v,!1,E),h.uniformMatrix4fv(w,!1,M),h.bindBuffer(h.ARRAY_BUFFER,_),h.bufferData(h.ARRAY_BUFFER,new Float32Array([-r,-n,-250,+r,-n,-250,+r,+n,-250,-r,-n,-250,+r,+n,-250,-r,+n,-250]),h.STATIC_DRAW),h.bindBuffer(h.ARRAY_BUFFER,A),h.bufferData(h.ARRAY_BUFFER,new Float32Array([0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1]),h.STATIC_DRAW),h.drawArrays(h.TRIANGLES,0,6),h.bindBuffer(h.ARRAY_BUFFER,_),h.bufferData(h.ARRAY_BUFFER,new Float32Array(b.points),h.STATIC_DRAW),h.bindBuffer(h.ARRAY_BUFFER,A),h.bufferData(h.ARRAY_BUFFER,new Float32Array(b.normals),h.STATIC_DRAW),e.forEach(t=>{let e=o.translation(t.x,t.y,0),r=o.multiply(T,e),n=o.inverse(e),i=o.transpose(n);h.uniformMatrix4fv(y,!1,r),h.uniformMatrix4fv(v,!1,i),h.uniformMatrix4fv(w,!1,e),h.drawArrays(h.TRIANGLES,0,b.points.length/3)})}}},function(t,e,r){"use strict";let o={createShader(t,e,r){let o=t.createShader(e);return t.shaderSource(o,r),t.compileShader(o),o},createProgram(t,e,r){let o=t.createProgram();return t.attachShader(o,e),t.attachShader(o,r),t.linkProgram(o),o},perspective(t,e,r,o){let n=Math.tan(.5*Math.PI-.5*t),i=1/(r-o);return[n/e,0,0,0,0,n,0,0,0,0,(r+o)*i,-1,0,0,r*o*i*2,0]},subtractVectors:(t,e,r)=>((r=r||new Float32Array(3))[0]=t[0]-e[0],r[1]=t[1]-e[1],r[2]=t[2]-e[2],r),xRotation(t,e){e=e||new Float32Array(16);let r=Math.cos(t),o=Math.sin(t);return e[0]=1,e[1]=0,e[2]=0,e[3]=0,e[4]=0,e[5]=r,e[6]=o,e[7]=0,e[8]=0,e[9]=-o,e[10]=r,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,e},yRotation(t,e){e=e||new Float32Array(16);let r=Math.cos(t),o=Math.sin(t);return e[0]=r,e[1]=0,e[2]=-o,e[3]=0,e[4]=0,e[5]=1,e[6]=0,e[7]=0,e[8]=o,e[9]=0,e[10]=r,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,e},transpose:(t,e)=>((e=e||new Float32Array(16))[0]=t[0],e[1]=t[4],e[2]=t[8],e[3]=t[12],e[4]=t[1],e[5]=t[5],e[6]=t[9],e[7]=t[13],e[8]=t[2],e[9]=t[6],e[10]=t[10],e[11]=t[14],e[12]=t[3],e[13]=t[7],e[14]=t[11],e[15]=t[15],e),lookAt(t,e,r,n){n=n||new Float32Array(16);let i=o.normalize(o.subtractVectors(t,e)),a=o.normalize(o.cross(r,i)),s=o.normalize(o.cross(i,a));return n[0]=a[0],n[1]=a[1],n[2]=a[2],n[3]=0,n[4]=s[0],n[5]=s[1],n[6]=s[2],n[7]=0,n[8]=i[0],n[9]=i[1],n[10]=i[2],n[11]=0,n[12]=t[0],n[13]=t[1],n[14]=t[2],n[15]=1,n},cross:(t,e,r)=>((r=r||new Float32Array(3))[0]=t[1]*e[2]-t[2]*e[1],r[1]=t[2]*e[0]-t[0]*e[2],r[2]=t[0]*e[1]-t[1]*e[0],r),normalize(t,e){e=e||new Float32Array(3);let r=Math.sqrt(t[0]*t[0]+t[1]*t[1]+t[2]*t[2]);return r>1e-5&&(e[0]=t[0]/r,e[1]=t[1]/r,e[2]=t[2]/r),e},multiply(t,e){let r=t[0],o=t[1],n=t[2],i=t[3],a=t[4],s=t[5],l=t[6],u=t[7],c=t[8],h=t[9],f=t[10],d=t[11],m=t[12],p=t[13],y=t[14],v=t[15],g=e[0],w=e[1],_=e[2],A=e[3],b=e[4],R=e[5],F=e[6],x=e[7],L=e[8],T=e[9],P=e[10],M=e[11],B=e[12],S=e[13],E=e[14],C=e[15];return[g*r+w*a+_*c+A*m,g*o+w*s+_*h+A*p,g*n+w*l+_*f+A*y,g*i+w*u+_*d+A*v,b*r+R*a+F*c+x*m,b*o+R*s+F*h+x*p,b*n+R*l+F*f+x*y,b*i+R*u+F*d+x*v,L*r+T*a+P*c+M*m,L*o+T*s+P*h+M*p,L*n+T*l+P*f+M*y,L*i+T*u+P*d+M*v,B*r+S*a+E*c+C*m,B*o+S*s+E*h+C*p,B*n+S*l+E*f+C*y,B*i+S*u+E*d+C*v]},translation:(t,e,r)=>[1,0,0,0,0,1,0,0,0,0,1,0,t,e,r,1],translate:(t,e,r,n)=>o.multiply(t,o.translation(e,r,n)),inverse(t){let e=t[0],r=t[1],o=t[2],n=t[3],i=t[4],a=t[5],s=t[6],l=t[7],u=t[8],c=t[9],h=t[10],f=t[11],d=t[12],m=t[13],p=t[14],y=t[15],v=h*y,g=p*f,w=s*y,_=p*l,A=s*f,b=h*l,R=o*y,F=p*n,x=o*f,L=h*n,T=o*l,P=s*n,M=u*m,B=d*c,S=i*m,E=d*a,C=i*c,I=u*a,U=e*m,D=d*r,k=e*c,j=u*r,W=e*a,O=i*r,V=v*a+_*c+A*m-(g*a+w*c+b*m),Y=g*r+R*c+L*m-(v*r+F*c+x*m),z=w*r+F*a+T*m-(_*r+R*a+P*m),H=b*r+x*a+P*c-(A*r+L*a+T*c),N=1/(e*V+i*Y+u*z+d*H);return[N*V,N*Y,N*z,N*H,N*(g*i+w*u+b*d-(v*i+_*u+A*d)),N*(v*e+F*u+x*d-(g*e+R*u+L*d)),N*(_*e+R*i+P*d-(w*e+F*i+T*d)),N*(A*e+L*i+T*u-(b*e+x*i+P*u)),N*(M*l+E*f+C*y-(B*l+S*f+I*y)),N*(B*n+U*f+j*y-(M*n+D*f+k*y)),N*(S*n+D*l+W*y-(E*n+U*l+O*y)),N*(I*n+k*l+O*f-(C*n+j*l+W*f)),N*(S*h+I*p+B*s-(C*p+M*s+E*h)),N*(k*p+M*o+D*h-(U*h+j*p+B*o)),N*(U*s+O*p+E*o-(W*p+S*o+D*s)),N*(W*h+C*o+j*s-(k*s+O*h+I*o))]}};t.exports=o},function(t,e,r){"use strict";t.exports=function(){let t=[],e=[],r=[],o=2*Math.PI/12,n=51,i=19,a=0,s=o;for(let l=0;l<12;l++){let l=Math.cos(a),u=Math.sin(a),c=10*l,h=10*u,f=Math.cos(s),d=Math.sin(s),m=10*f,p=10*d;t.push(c,h,250,m,p,250,0,0,250),r.push(0,1,0,0,1,0,0,1,0),e.push(n,i,3,n,i,3,n,i,3),t.push(c,h,-250,m,p,-250,c,h,250,m,p,250,c,h,250,m,p,-250),r.push(l,u,0,f,d,0,l,u,0,f,d,0,l,u,0,f,d,0),e.push(n,i,3,n,i,3,n,i,3,n,i,3,n,i,3,n,i,3),a=s,s+=o}return{points:t,colors:e,normals:r}}},function(t,e,r){r(0),r(1),r(2),r(5),t.exports=r(3)},function(t,e,r){"use strict";const o=r(0);setTimeout(()=>{window.app=new o})}]);