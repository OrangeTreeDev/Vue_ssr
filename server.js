const Koa = require('koa');
const Vue = require('vue');
const FS = require('fs');
const renderer = require('vue-server-renderer').createRenderer({
    template: FS.readFileSync('./index.html', 'utf-8'),
});
const vueTempalte = new Vue({
    template: '<h2>hello vue</h2>',
});

const app = new Koa();

// 设置签名的密钥
app.keys = ['im a newer secret', 'i like turtle'];

/**
 * @description 添加x-response-time头
 */
app.use(async (ctx, next) => {
    const start = Date.now();
    await next();
    const gap = Date.now() - start;
    ctx.set('X-Response-Time', `${gap}ms`);
    ctx.cookies.set('username', 'lixiang', {
        signed: true,
        maxAge: Date.now() + 3000,
    });
});

/**
 * @description 打印日志
 */
app.use(async (ctx, next) => {
    const start = Date.now();
    await next();
    const gap = Date.now() - start;
    console.log(`${ctx.method} ${ctx.url} - ${gap}`);
});

/**
 * @description 写入响应体
 */
app.use(async ctx => {
    renderer.renderToString(vueTempalte, (err, html) => {
        if (err) {
            ctx.throw(500, 'internal server error');
        };
        ctx.body = html;
    });
});

app.listen(3000);
