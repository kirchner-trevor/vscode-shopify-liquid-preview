import TagToken from 'liquidjs/dist/parser/tag-token';
import Token from 'liquidjs/dist/parser/token';
import Context from 'liquidjs/dist/context/context';
import ITagImplOptions from 'liquidjs/dist/template/tag/itag-impl-options'

// usage {% abort_message('message to display')  %}
export default <ITagImplOptions>{
    parse: (tagToken: TagToken, remainTokens: Token[]) => {
        
    },
    render: async (ctx: Context) => {

    }
}