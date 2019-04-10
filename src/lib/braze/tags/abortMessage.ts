import TagToken from 'liquidjs/dist/parser/tag-token'
import Context from 'liquidjs/dist/context/context'
import ITagImplOptions from 'liquidjs/dist/template/tag/itag-impl-options'
import { AbortError } from '../../errors';

const re = new RegExp(`\\(('([^']*)'|"([^"]*)")?\\)`)

// usage {% abort_message('message to display')  %}
export default <ITagImplOptions>{
    parse: function(tagToken: TagToken) {
        const match = tagToken.args.match(re)
        if (!match) {
            throw new Error(`illegal token ${tagToken.raw}`);
        }
 
        this.msg = match[2] || match[3] || 'message is aborted'
    },
    render: async function(ctx: Context) {
        throw new AbortError(this.msg)
    }
}