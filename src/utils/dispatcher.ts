import Axios from "axios"

/**
 * An `event` dispatcher to send out new `event` of a topic to subscribers
 * @param url the `url` to dispatch event to
 * @param event the `event` to be dispatched 
 */
export default async ( url: string, event: TopicEvent) => {
    try{
        await Axios.post(url, JSON.stringify(event), { headers: { "Content-type": "application/json"}})
    }catch(e) {
        console.log(`Error Occured While Dispatching event to ${url}`)
    }
}