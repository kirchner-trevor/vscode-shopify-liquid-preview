import TagToken from 'liquidjs/dist/parser/tag-token'
import Context from 'liquidjs/dist/context/context'
import ITagImplOptions from 'liquidjs/dist/template/tag/itag-impl-options'
import * as rp from 'request-promise-native'

const re = new RegExp(`(https?[^\\s]+)(\\s+.*)?$`)

// usage {% connected_content https://example.com :basic_auth username :retry :save name %}
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
        const headers = {}
        if (this.options.basic_auth) {
            const secrets = ctx.environments['__secrets']
            if (!secrets) {
                throw new Error('No secrets defined in context!')
            }
            const secret = secrets[this.options.basic_auth]
            if (!secret) {
                throw new Error(`No secret found for ${this.options.basic_auth}`)
            }

            const authStr = Buffer.from(`${this.options.basic_auth}:${secret}`).toString('base64')
            headers['Authorization'] = `Basic ${authStr}`
        }
        
        const res = await rp({
            method: 'GET',
            uri: this.url,
            headers: headers,
            json: !!this.options.save
        }).promise();

        if (this.options.save) {
            ctx.scopes[0][this.options.save] = res
        } else {
            return res
        }
    }
}