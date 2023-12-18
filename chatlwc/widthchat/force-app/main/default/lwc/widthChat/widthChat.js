import { LightningElement,track } from 'lwc';

// Config
// Run 'node index' and 'ngrok http 80' and use the proxy URL
// reported by ngrok.
const SERVER_URL = 'https://553a-106-51-180-132.ngrok-free.app';


export default class WidthChat extends LightningElement {

    messages = []; // Holds the chat messages and LLM responses
    userQuery = ''; // Holds the user's current query

    // Handle the input change event to keep track of user query
    handleInputChange(event) {
        this.userQuery = event.target.value;
    }

    // Send user's query to LLM and process the response
    async sendQuery(event) {
        if (this.userQuery.trim() === '') {
            // No query to send
            return;
        }

        // Append user query to the chat
        const queryMessage = {
            id: this.messages.length + 1,
            text: this.userQuery,
            isLLMResponse: false
        };
        this.messages = [...this.messages, queryMessage];
        console.log(this.messages.length);
        
        this.renderHtmlResponse(queryMessage);

        // Get a response from the LLM.
        let responseMessage = await this.getLLMResponse(this.userQuery);
        console.log(this.messages.length);

        // After updating the messages, wait for the DOM to update and then render the HTML response
        this.renderHtmlResponse(responseMessage);
        
        // Reset the input after sending the query
        this.userQuery = '';
    }
    
    async getLLMResponse(query) {
        const response = await fetch(
            `${SERVER_URL}/llm`,
            {
                method: 'POST',
                body: query,
                headers: {
                'Content-Type': 'text/plain',
                'ngrok-skip-browser-warning': '42',
                'Access-Control-Allow-Origin': '*'
                }
            }
        );
        
        const data = await response.json();
        console.log(data);
      
        const responseHtml = `<div><img class="resize" src="${data.image}"></img></div>${data.answer}`;
        
        const responseMessage = {
            id: this.messages.length + 1,
            text: responseHtml,
            isLLMResponse: true
        };
        this.messages = [...this.messages, responseMessage];

        return responseMessage;
        
    }

    // Renders the HTML response within the component
    renderHtmlResponse(message) {
        // Use `lwc:dom="manual"` directive to manually manage the DOM for this part
        const chatArea = this.template.querySelector('.chat-area');
        let msgHtml = '';
        if (!message.isLLMResponse) {
          msgHtml += `<div class="usermsg"><strong>You: </strong><span>${message.text}</span></div>`;
        } else {
          msgHtml += `<div class="asstmsg"><strong>Asst: </strong>${message.text}</div>`;
        }
        chatArea.innerHTML += msgHtml; // Render the HTML content
     }

    // Simulate the call to the backend and the LLM response
    simulateLLMResponse(query) {
        // Simulate an LLM response
        const response = 'This is the formatted <strong>response</strong> from the LLM.<img src="..." alt="Image"/>';

        const responseMessage = {
            id: this.messages.length + 1,
            text: response,
            isLLMResponse: true
        };
        this.messages = [...this.messages, responseMessage];

        return responseMessage;
    }


    async sendMsg() {
      const response = await fetch(
        `${SERVER_URL}/testapi`,
        {
            headers: {
                'ngrok-skip-browser-warning': '42',
                'Access-Control-Allow-Origin': '*'
            }
        }
      );

      const items = await response.json();
    }
}
