if(!self.define){let e,a={};const s=(s,i)=>(s=new URL(s+".js",i).href,a[s]||new Promise((a=>{if("document"in self){const e=document.createElement("script");e.src=s,e.onload=a,document.head.appendChild(e)}else e=s,importScripts(s),a()})).then((()=>{let e=a[s];if(!e)throw new Error(`Module ${s} didn’t register its module`);return e})));self.define=(i,c)=>{const t=e||("document"in self?document.currentScript.src:"")||location.href;if(a[t])return;let r={};const n=e=>s(e,t),o={module:{uri:t},exports:r,require:n};a[t]=Promise.all(i.map((e=>o[e]||n(e)))).then((e=>(c(...e),r)))}}define(["./workbox-4754cb34"],(function(e){"use strict";importScripts(),self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"/_next/app-build-manifest.json",revision:"e68d5862ac40ee86c19823c4ad3b275e"},{url:"/_next/static/HBmmVbPFxlrCx7wOG6aGh/_buildManifest.js",revision:"b222cbf4d8e1f47e27a8925222733e53"},{url:"/_next/static/HBmmVbPFxlrCx7wOG6aGh/_ssgManifest.js",revision:"b6652df95db52feb4daf4eca35380933"},{url:"/_next/static/chunks/081ca426-22da5055d7478a83.js",revision:"HBmmVbPFxlrCx7wOG6aGh"},{url:"/_next/static/chunks/0e762574-47eda8644b011a82.js",revision:"HBmmVbPFxlrCx7wOG6aGh"},{url:"/_next/static/chunks/282-87ce33a23f4658c1.js",revision:"HBmmVbPFxlrCx7wOG6aGh"},{url:"/_next/static/chunks/3865.0789f5f73778aec3.js",revision:"0789f5f73778aec3"},{url:"/_next/static/chunks/3975359d.e6f523c5500bcd5e.js",revision:"e6f523c5500bcd5e"},{url:"/_next/static/chunks/4609-9a0aa825bc4d3e89.js",revision:"HBmmVbPFxlrCx7wOG6aGh"},{url:"/_next/static/chunks/46be18a3-0b7a47e95af4369d.js",revision:"HBmmVbPFxlrCx7wOG6aGh"},{url:"/_next/static/chunks/4710-48b83f83eecd021c.js",revision:"HBmmVbPFxlrCx7wOG6aGh"},{url:"/_next/static/chunks/479ba886-1d7d5362b4d8e8e6.js",revision:"HBmmVbPFxlrCx7wOG6aGh"},{url:"/_next/static/chunks/4805-990b050d407e4a51.js",revision:"HBmmVbPFxlrCx7wOG6aGh"},{url:"/_next/static/chunks/4999-c071f31b5baf1821.js",revision:"HBmmVbPFxlrCx7wOG6aGh"},{url:"/_next/static/chunks/5288-210c31d94b0d4467.js",revision:"HBmmVbPFxlrCx7wOG6aGh"},{url:"/_next/static/chunks/52ab8b6c-86511ae023a2efe9.js",revision:"HBmmVbPFxlrCx7wOG6aGh"},{url:"/_next/static/chunks/5411-c123b0e94050dfc0.js",revision:"HBmmVbPFxlrCx7wOG6aGh"},{url:"/_next/static/chunks/5956-513b942f09ec062e.js",revision:"HBmmVbPFxlrCx7wOG6aGh"},{url:"/_next/static/chunks/59650de3-3da7f87c2ac551ab.js",revision:"HBmmVbPFxlrCx7wOG6aGh"},{url:"/_next/static/chunks/5e22fd23-d785ed6ec871f0f1.js",revision:"HBmmVbPFxlrCx7wOG6aGh"},{url:"/_next/static/chunks/6300-4f3d5d6914b0aabd.js",revision:"HBmmVbPFxlrCx7wOG6aGh"},{url:"/_next/static/chunks/66ec4792-b60311081aacd669.js",revision:"HBmmVbPFxlrCx7wOG6aGh"},{url:"/_next/static/chunks/7023-9fc60270d16bed99.js",revision:"HBmmVbPFxlrCx7wOG6aGh"},{url:"/_next/static/chunks/7397-7027626fe282da63.js",revision:"HBmmVbPFxlrCx7wOG6aGh"},{url:"/_next/static/chunks/795d4814-839d1fc28a50767b.js",revision:"HBmmVbPFxlrCx7wOG6aGh"},{url:"/_next/static/chunks/8472-859564091d95be07.js",revision:"HBmmVbPFxlrCx7wOG6aGh"},{url:"/_next/static/chunks/8647-750b9a527290c5a2.js",revision:"HBmmVbPFxlrCx7wOG6aGh"},{url:"/_next/static/chunks/8782-f0e7b58c76ea3dc2.js",revision:"HBmmVbPFxlrCx7wOG6aGh"},{url:"/_next/static/chunks/8e1d74a4-a3bd4e7686110970.js",revision:"HBmmVbPFxlrCx7wOG6aGh"},{url:"/_next/static/chunks/9327.e04402579019b64a.js",revision:"e04402579019b64a"},{url:"/_next/static/chunks/94730671-25aa14c21deaf2e1.js",revision:"HBmmVbPFxlrCx7wOG6aGh"},{url:"/_next/static/chunks/9814-a57d808deaf87600.js",revision:"HBmmVbPFxlrCx7wOG6aGh"},{url:"/_next/static/chunks/9c4e2130-f0b5073f7130ffca.js",revision:"HBmmVbPFxlrCx7wOG6aGh"},{url:"/_next/static/chunks/app/(auth)/signin/page-0a4e075c2055caac.js",revision:"HBmmVbPFxlrCx7wOG6aGh"},{url:"/_next/static/chunks/app/(auth)/signup/page-da62864fb49550b0.js",revision:"HBmmVbPFxlrCx7wOG6aGh"},{url:"/_next/static/chunks/app/_not-found/page-5c77fe1d1e414d6d.js",revision:"HBmmVbPFxlrCx7wOG6aGh"},{url:"/_next/static/chunks/app/asset/%5BidAsset%5D/page-6f7cf8a49eaf1172.js",revision:"HBmmVbPFxlrCx7wOG6aGh"},{url:"/_next/static/chunks/app/asset/page-bb447cf8959e96b3.js",revision:"HBmmVbPFxlrCx7wOG6aGh"},{url:"/_next/static/chunks/app/calendar/page-ec911631236ef45e.js",revision:"HBmmVbPFxlrCx7wOG6aGh"},{url:"/_next/static/chunks/app/camera/page-bd7b4f581e519531.js",revision:"HBmmVbPFxlrCx7wOG6aGh"},{url:"/_next/static/chunks/app/chart/page-bc243be24952853c.js",revision:"HBmmVbPFxlrCx7wOG6aGh"},{url:"/_next/static/chunks/app/forms/form-elements/page-2cc581678c21adb6.js",revision:"HBmmVbPFxlrCx7wOG6aGh"},{url:"/_next/static/chunks/app/forms/form-layout/page-cc350a33d524cacd.js",revision:"HBmmVbPFxlrCx7wOG6aGh"},{url:"/_next/static/chunks/app/layout-3c2b64c7ea19188a.js",revision:"HBmmVbPFxlrCx7wOG6aGh"},{url:"/_next/static/chunks/app/listmaintenance/page-1a22fb666bff895e.js",revision:"HBmmVbPFxlrCx7wOG6aGh"},{url:"/_next/static/chunks/app/listoutstanding/page-0d9875a7afe41a18.js",revision:"HBmmVbPFxlrCx7wOG6aGh"},{url:"/_next/static/chunks/app/new_asset/page-e4bdad393994a4b8.js",revision:"HBmmVbPFxlrCx7wOG6aGh"},{url:"/_next/static/chunks/app/new_service/page-c8761718eb15352b.js",revision:"HBmmVbPFxlrCx7wOG6aGh"},{url:"/_next/static/chunks/app/newservice/page-b6387dadda584788.js",revision:"HBmmVbPFxlrCx7wOG6aGh"},{url:"/_next/static/chunks/app/opname/%5BidRegister%5D/page-1a180c7ee6fc57d3.js",revision:"HBmmVbPFxlrCx7wOG6aGh"},{url:"/_next/static/chunks/app/opname/%5BidRegister%5D/printform/page-dd27b3ce130d672b.js",revision:"HBmmVbPFxlrCx7wOG6aGh"},{url:"/_next/static/chunks/app/opname/%5BidRegister%5D/printout/page-5b9244fbfaa1288b.js",revision:"HBmmVbPFxlrCx7wOG6aGh"},{url:"/_next/static/chunks/app/opname/page-7e6d8c40382a0d5f.js",revision:"HBmmVbPFxlrCx7wOG6aGh"},{url:"/_next/static/chunks/app/page-90bb558c1aafe7bd.js",revision:"HBmmVbPFxlrCx7wOG6aGh"},{url:"/_next/static/chunks/app/parts/%5BidPart%5D/page-0b562215ba8f3d58.js",revision:"HBmmVbPFxlrCx7wOG6aGh"},{url:"/_next/static/chunks/app/parts/page-978004d0e3539d15.js",revision:"HBmmVbPFxlrCx7wOG6aGh"},{url:"/_next/static/chunks/app/partsin/page-cf72de3ec2c9f673.js",revision:"HBmmVbPFxlrCx7wOG6aGh"},{url:"/_next/static/chunks/app/partsorder/%5BidRegister%5D/page-c29d8a59d5d21690.js",revision:"HBmmVbPFxlrCx7wOG6aGh"},{url:"/_next/static/chunks/app/partsorder/page-4c81df85fc7fd91b.js",revision:"HBmmVbPFxlrCx7wOG6aGh"},{url:"/_next/static/chunks/app/partsout/page-2eca547271c9dcca.js",revision:"HBmmVbPFxlrCx7wOG6aGh"},{url:"/_next/static/chunks/app/partsservice/%5BidRegister%5D/page-4acf7cef7389948d.js",revision:"HBmmVbPFxlrCx7wOG6aGh"},{url:"/_next/static/chunks/app/partsservice/page-4952a0dcafbd7cfa.js",revision:"HBmmVbPFxlrCx7wOG6aGh"},{url:"/_next/static/chunks/app/partsservice/print/page-3fd03bc0483835c4.js",revision:"HBmmVbPFxlrCx7wOG6aGh"},{url:"/_next/static/chunks/app/partstransaction/page-9a675f986de67117.js",revision:"HBmmVbPFxlrCx7wOG6aGh"},{url:"/_next/static/chunks/app/profile/page-ee36fd8e833fb31b.js",revision:"HBmmVbPFxlrCx7wOG6aGh"},{url:"/_next/static/chunks/app/pushnotif/page-ad3a3f38fb3baa50.js",revision:"HBmmVbPFxlrCx7wOG6aGh"},{url:"/_next/static/chunks/app/scanner/page-63f196037de49546.js",revision:"HBmmVbPFxlrCx7wOG6aGh"},{url:"/_next/static/chunks/app/settings/page-924e0475de5e7f36.js",revision:"HBmmVbPFxlrCx7wOG6aGh"},{url:"/_next/static/chunks/app/tables/page-b0c49c40d185c9e7.js",revision:"HBmmVbPFxlrCx7wOG6aGh"},{url:"/_next/static/chunks/app/tests/page-60faf4214c594186.js",revision:"HBmmVbPFxlrCx7wOG6aGh"},{url:"/_next/static/chunks/app/ui/alerts/page-ece251b38592ab68.js",revision:"HBmmVbPFxlrCx7wOG6aGh"},{url:"/_next/static/chunks/app/ui/buttons/page-4d4ba2e9fa7e6b89.js",revision:"HBmmVbPFxlrCx7wOG6aGh"},{url:"/_next/static/chunks/bc9e92e6-63e8a8cdc7d01b30.js",revision:"HBmmVbPFxlrCx7wOG6aGh"},{url:"/_next/static/chunks/e34aaff9-2ef4f62c2afdf77c.js",revision:"HBmmVbPFxlrCx7wOG6aGh"},{url:"/_next/static/chunks/eec3d76d-55889697b3e09487.js",revision:"HBmmVbPFxlrCx7wOG6aGh"},{url:"/_next/static/chunks/f25cdb8d-8b4e78e931d0ba66.js",revision:"HBmmVbPFxlrCx7wOG6aGh"},{url:"/_next/static/chunks/f7333993-9ea081f16f093629.js",revision:"HBmmVbPFxlrCx7wOG6aGh"},{url:"/_next/static/chunks/f8025e75-bd948a5d00c4ce9a.js",revision:"HBmmVbPFxlrCx7wOG6aGh"},{url:"/_next/static/chunks/fd9d1056-f5aea97a26759e85.js",revision:"HBmmVbPFxlrCx7wOG6aGh"},{url:"/_next/static/chunks/framework-20adfd98f723306f.js",revision:"HBmmVbPFxlrCx7wOG6aGh"},{url:"/_next/static/chunks/main-1fdc4de32c39f1d6.js",revision:"HBmmVbPFxlrCx7wOG6aGh"},{url:"/_next/static/chunks/main-app-4c1918eceae45959.js",revision:"HBmmVbPFxlrCx7wOG6aGh"},{url:"/_next/static/chunks/pages/_app-00b74eae5e8dab51.js",revision:"HBmmVbPFxlrCx7wOG6aGh"},{url:"/_next/static/chunks/pages/_error-c72a1f77a3c0be1b.js",revision:"HBmmVbPFxlrCx7wOG6aGh"},{url:"/_next/static/chunks/polyfills-78c92fac7aa8fdd8.js",revision:"79330112775102f91e1010318bae2bd3"},{url:"/_next/static/chunks/webpack-bad14e8dbca35736.js",revision:"HBmmVbPFxlrCx7wOG6aGh"},{url:"/_next/static/css/8f907a4166ac3756.css",revision:"8f907a4166ac3756"},{url:"/_next/static/css/f71dc2bc8d7acad0.css",revision:"f71dc2bc8d7acad0"},{url:"/_next/static/media/Satoshi-Black.12d5a2e3.ttf",revision:"12d5a2e3"},{url:"/_next/static/media/Satoshi-Black.28873509.woff",revision:"28873509"},{url:"/_next/static/media/Satoshi-Black.c6d20a6b.woff2",revision:"c6d20a6b"},{url:"/_next/static/media/Satoshi-BlackItalic.22c3e8d9.woff",revision:"22c3e8d9"},{url:"/_next/static/media/Satoshi-BlackItalic.33bc16b8.ttf",revision:"33bc16b8"},{url:"/_next/static/media/Satoshi-BlackItalic.5400951d.woff2",revision:"5400951d"},{url:"/_next/static/media/Satoshi-Bold.12084922.woff2",revision:"12084922"},{url:"/_next/static/media/Satoshi-Bold.b28a04c4.woff",revision:"b28a04c4"},{url:"/_next/static/media/Satoshi-Bold.c60efc8f.ttf",revision:"c60efc8f"},{url:"/_next/static/media/Satoshi-BoldItalic.b59cf06f.woff",revision:"b59cf06f"},{url:"/_next/static/media/Satoshi-BoldItalic.c1d97e57.ttf",revision:"c1d97e57"},{url:"/_next/static/media/Satoshi-BoldItalic.e51fcc53.woff2",revision:"e51fcc53"},{url:"/_next/static/media/Satoshi-Italic.3eb4bb53.woff2",revision:"3eb4bb53"},{url:"/_next/static/media/Satoshi-Italic.43440d31.woff",revision:"43440d31"},{url:"/_next/static/media/Satoshi-Italic.84cd9c1d.ttf",revision:"84cd9c1d"},{url:"/_next/static/media/Satoshi-Light.121b151d.ttf",revision:"121b151d"},{url:"/_next/static/media/Satoshi-Light.ce217c5d.woff",revision:"ce217c5d"},{url:"/_next/static/media/Satoshi-Light.d3f699ab.woff2",revision:"d3f699ab"},{url:"/_next/static/media/Satoshi-LightItalic.0d87c97a.woff2",revision:"0d87c97a"},{url:"/_next/static/media/Satoshi-LightItalic.51efbee6.woff",revision:"51efbee6"},{url:"/_next/static/media/Satoshi-LightItalic.58b0e971.ttf",revision:"58b0e971"},{url:"/_next/static/media/Satoshi-Medium.22539d17.woff2",revision:"22539d17"},{url:"/_next/static/media/Satoshi-Medium.8217b72e.ttf",revision:"8217b72e"},{url:"/_next/static/media/Satoshi-Medium.f3941e68.woff",revision:"f3941e68"},{url:"/_next/static/media/Satoshi-MediumItalic.14c46485.ttf",revision:"14c46485"},{url:"/_next/static/media/Satoshi-MediumItalic.17afee50.woff2",revision:"17afee50"},{url:"/_next/static/media/Satoshi-MediumItalic.5450477c.woff",revision:"5450477c"},{url:"/_next/static/media/Satoshi-Regular.a12eb4fb.ttf",revision:"a12eb4fb"},{url:"/_next/static/media/Satoshi-Regular.b1dca2a5.woff2",revision:"b1dca2a5"},{url:"/_next/static/media/Satoshi-Regular.bb2accee.woff",revision:"bb2accee"},{url:"/icon-192x192.png",revision:"b4b7e9faf42348833b279a852723ac8c"},{url:"/icon-256x256.png",revision:"809378b0de1c357058b92d315d928cd3"},{url:"/icon-384x384.png",revision:"be485025d413fc65cd767cddb96042d7"},{url:"/icon-512x512.png",revision:"3f1d406ec17e7645a547a71f2d0e7252"},{url:"/images/best-value-banner.png",revision:"1e1854f4717f25136115ed095d37273e"},{url:"/images/brand/brand-01.svg",revision:"2dd59410e0a65ce7183c0edb82d51cec"},{url:"/images/brand/brand-02.svg",revision:"1cd9b0680cbfb78805420659bc1e077d"},{url:"/images/brand/brand-03.svg",revision:"0eca25adef3e8225d50860ec9e935082"},{url:"/images/brand/brand-04.svg",revision:"7dc6ac3b2da4adea0f941e472486a4bc"},{url:"/images/brand/brand-05.svg",revision:"3ebe4ebf55a7faa2aa74ce775c7340fb"},{url:"/images/cards/cards-01.png",revision:"bee503d28d650dc258b6376511f5facd"},{url:"/images/cards/cards-02.png",revision:"704f58c328ebb8c091643b238bd1c62b"},{url:"/images/cards/cards-03.png",revision:"36a3fa394039239a716caf01970174ca"},{url:"/images/cards/cards-04.png",revision:"4443f6a85e3b7e775afc640584f866da"},{url:"/images/cards/cards-05.png",revision:"2d0223d89e31b56459d147647db3a7f0"},{url:"/images/cards/cards-06.png",revision:"080a048d0d862ef60ae4e67db3caf930"},{url:"/images/country/country-01.svg",revision:"59c5ae713308034a1e0a8f138682b2a3"},{url:"/images/country/country-02.svg",revision:"d5f66a93a4ade95ad2a72eb195f85028"},{url:"/images/country/country-03.svg",revision:"8bd9f1d0cdad554fbb6551e0e2316493"},{url:"/images/country/country-04.svg",revision:"47978f51b9a5e565cdf220612aaa4170"},{url:"/images/country/country-05.svg",revision:"b5a8a2f9422c1b8846dabbcf149a673e"},{url:"/images/country/country-06.svg",revision:"f39891596b6c5eeee69d2a02df9f4142"},{url:"/images/cover/cover-01.png",revision:"972c64bf2ce84e837c5b3a2094281e16"},{url:"/images/favicon.ico",revision:"94e47f5dcf4e91b704f169ebcb4c9390"},{url:"/images/icon/icon-arrow-down.svg",revision:"ab3cd915ffa427d34a5e89d864631b04"},{url:"/images/icon/icon-calendar.svg",revision:"b0baecc0aa9c16ead9a856fe58647914"},{url:"/images/icon/icon-copy-alt.svg",revision:"ccc6b1e6fd056d7d25978a064d6b68de"},{url:"/images/icon/icon-moon.svg",revision:"f0c56a1b9282024a7c210588a79dc8a3"},{url:"/images/icon/icon-sun.svg",revision:"99bd84f8192219382166d3264cf6bf8d"},{url:"/images/illustration/illustration-01.svg",revision:"fafb329f9d07ab161111f0c949468496"},{url:"/images/illustration/illustration-02.svg",revision:"51cd787b205a6ec6957af69bd27b5e75"},{url:"/images/illustration/illustration-03.svg",revision:"5929bc478f2aab9cb10aaa65a64f6064"},{url:"/images/illustration/illustration-04.svg",revision:"c37d18bb983e5d6e29d404c6690b7efb"},{url:"/images/logo/logo-dark.svg",revision:"c276d13c01ebc7286a6153935e8efa80"},{url:"/images/logo/logo-icon.svg",revision:"42501f0dc1f98ffbe699ba8a15777e12"},{url:"/images/logo/logo.svg",revision:"8493d27b89070d57f004ac0369be1c92"},{url:"/images/product/product-01.png",revision:"34be8cdb4dbf696fb0a39b39c5d94c4a"},{url:"/images/product/product-02.png",revision:"1a4633cb19e391dd753743d62b4a790b"},{url:"/images/product/product-03.png",revision:"2c213e5c10b79de985f7691ad21ca1e6"},{url:"/images/product/product-04.png",revision:"f45c5f8c16c8db472e6b6d7c16cdae9b"},{url:"/images/product/product-thumb.png",revision:"9cb86c53190c3026fb88dd00c232dd57"},{url:"/images/task/task-01.jpg",revision:"557544c08de1aba4220b710b03d999b0"},{url:"/images/user/user-01.png",revision:"c8ed34fe5094d3b127bb9c94633d6371"},{url:"/images/user/user-02.png",revision:"de3bd868997d3f445348922df73d8226"},{url:"/images/user/user-03.png",revision:"93b7c0c394b231732ebe8806448a95a8"},{url:"/images/user/user-04.png",revision:"118e66657a14921a61abc7d21261188b"},{url:"/images/user/user-05.png",revision:"d74bb3c54d3e3c32c73829d652d0d6f4"},{url:"/images/user/user-06.png",revision:"975408d09dc079b97f4ae46480af7ef5"},{url:"/images/user/user-07.png",revision:"e3058df7afaaf5b2dedd732445cfea5b"},{url:"/images/user/user-08.png",revision:"960cd052c95c75462fae0c9930a202db"},{url:"/images/user/user-09.png",revision:"15693dc3edc4775c384585aa757f2421"},{url:"/images/user/user-10.png",revision:"8bbed9cfd9a9e8a7d5ab3e1a43737380"},{url:"/images/user/user-11.png",revision:"11f4a43c10ec710e5e41f261a629ca82"},{url:"/images/user/user-12.png",revision:"8530b9ec54e0b67cb52b44bcbae5482c"},{url:"/images/user/user-13.png",revision:"cdb3cc59c44f18a8029a032a3952663d"},{url:"/logo/logo.png",revision:"b4b7e9faf42348833b279a852723ac8c"},{url:"/manifest.json",revision:"d0c671709941e9157d426b3822525e8a"}],{ignoreURLParametersMatching:[]}),e.cleanupOutdatedCaches(),e.registerRoute("/",new e.NetworkFirst({cacheName:"start-url",plugins:[{cacheWillUpdate:async({request:e,response:a,event:s,state:i})=>a&&"opaqueredirect"===a.type?new Response(a.body,{status:200,statusText:"OK",headers:a.headers}):a}]}),"GET"),e.registerRoute(/^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,new e.CacheFirst({cacheName:"google-fonts-webfonts",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:31536e3})]}),"GET"),e.registerRoute(/^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,new e.StaleWhileRevalidate({cacheName:"google-fonts-stylesheets",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:604800})]}),"GET"),e.registerRoute(/\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,new e.StaleWhileRevalidate({cacheName:"static-font-assets",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:604800})]}),"GET"),e.registerRoute(/\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,new e.StaleWhileRevalidate({cacheName:"static-image-assets",plugins:[new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\/_next\/image\?url=.+$/i,new e.StaleWhileRevalidate({cacheName:"next-image",plugins:[new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:mp3|wav|ogg)$/i,new e.CacheFirst({cacheName:"static-audio-assets",plugins:[new e.RangeRequestsPlugin,new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:mp4)$/i,new e.CacheFirst({cacheName:"static-video-assets",plugins:[new e.RangeRequestsPlugin,new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:js)$/i,new e.StaleWhileRevalidate({cacheName:"static-js-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:css|less)$/i,new e.StaleWhileRevalidate({cacheName:"static-style-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\/_next\/data\/.+\/.+\.json$/i,new e.StaleWhileRevalidate({cacheName:"next-data",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:json|xml|csv)$/i,new e.NetworkFirst({cacheName:"static-data-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:e})=>{if(!(self.origin===e.origin))return!1;const a=e.pathname;return!a.startsWith("/api/auth/")&&!!a.startsWith("/api/")}),new e.NetworkFirst({cacheName:"apis",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:16,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:e})=>{if(!(self.origin===e.origin))return!1;return!e.pathname.startsWith("/api/")}),new e.NetworkFirst({cacheName:"others",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:e})=>!(self.origin===e.origin)),new e.NetworkFirst({cacheName:"cross-origin",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:3600})]}),"GET")}));
