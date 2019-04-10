import TagToken from 'liquidjs/dist/parser/tag-token'
import Context from 'liquidjs/dist/context/context'
import ITagImplOptions from 'liquidjs/dist/template/tag/itag-impl-options'
import * as rp from 'request-promise-cache'

const re = new RegExp(`(https?[^\\s]+)(\\s+.*)?$`)

// usage {% connected_content https://example.com :basic_auth username :retry :save name :cache 900 %}
export default <ITagImplOptions>{
    parse: function(tagToken: TagToken) {
        const match = tagToken.args.match(re)
        if (!match) {
            throw new Error(`illegal token ${tagToken.raw}`);
        }
        this.url = match[1]
        const options = match[2]
        this.options = {}
        if (options) {
            options.split(/\s*:/).forEach((optStr) => {
                if (optStr == '') return
                
                const opts = optStr.split(/\s+/);
                this.options[opts[0]] = opts.length > 1 ? opts[1] : true
            })
        }
    },
    render: async function(ctx: Context) {
        const renderedUrl = await this.liquid.parseAndRender(this.url, ctx.getAll())
        console.log(`rendered url is ${renderedUrl}`)

        const rpOption = {
            method: 'GET',
            headers: {
                'User-Agent': 'braze-liquid-preview-vscode-extension',
            },
            uri: renderedUrl,
            json: !!this.options.save,
            cacheKey: renderedUrl,
            cacheTTL: (this.options.cache == undefined ? 300 : this.options.cache) * 1000,
        }

        if (this.options.basic_auth) {
            const secrets = ctx.environments['__secrets']
            if (!secrets) {
                throw new Error('No secrets defined in context!')
            }
            const secret = secrets[this.options.basic_auth]
            if (!secret) {
                throw new Error(`No secret found for ${this.options.basic_auth}`)
            }

            if (!secret.username || !secret.password) {
                throw new Error(`No username or password set for ${this.options.basic_auth}`);
            }

            rpOption['auth'] = {
                user: secret.username,
                pass: secret.password,
            }
        }

        const res = await rp(rpOption);

        if (this.options.save) {
            ctx.scopes[0][this.options.save] = res
        } else {
            return res
        }
    }
}