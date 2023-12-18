    'use strict';

// Imports
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const openai = require('openai');

const openaic = new openai.OpenAI();

// === Config ===
const PORT = 8000;

// Server https://expressjs.com/en/guide/routing.html
const app = express();

// enable CORS for any unknown origin
app.use(cors());

app.use(express.text({ type: 'text/plain' }))

app.get('/testapi', function(req, res) {
  console.log('testapi:\n', JSON.stringify(req.body, null, 4));

  const response = {
    'product' : 'Keysight U1234 oscilloscope',
    'description' : 'High precision benchtop oscilloscope from Keysight',
    'max-voltage' : '10'
  }

  res.json(response);
});


app.post('/llm', async (req, res) => {

  const userPrompt = req.body;
  console.log(userPrompt);
  
  const answer = await getMainAnswer(userPrompt);
  console.log(answer);
  
  const product = await getMainProduct(userPrompt);
  console.log(product);
  
  const imageUrl = await generateImage(product);
  console.log(imageUrl);

  res.json({
    'answer' : answer,
    'product' : product,
    'image' : imageUrl
  });
});


async function getMainAnswer(userPrompt) {
  const systemPrompt = `Pretend that you're a product search assistant for a sales professional in an
            electronics test and measurement wholesaler company that sells products of manufacturers
            like Keysight, Tektonix, Rohde & Schwarz, Digilent, etc.
            Pretend you have access to a large list of their electronic test and measurement products 
            like signal generators, oscilloscopes, digital multimeters, spectrum analyzers, 
            and similar products.
            Pretend you also know each product's specifications and current inventory levels.
            Just make up realistic sounding inventory data, dates, current information about
            availability.
            For any query, identify the criteria and reply with messages like these making up
            random but relevant and believable specifications, model numbers, and availability dates:
            
            1. Yes, we have spectrum analyzers in stock that can test a video bandwidth of >= 2MHz
            and are available from our Michelin distribution center by August 31, 2023. 
            The available model is the Rohde & Schwarz FSW50, 50 GHz, 80 MHz bandwidth and noise figure
            application. The assetId for this model is AC-0182.
            
            2. The next spectrum analyzer available from our Rungis distribution center is the Keysight
            N90308, 50 GHz, 40 MHz, Low noise path, with asset ID AC-0020, and it'll be available by
            8/22/23. However, the Keysight N9030A, 50 GHz, 160 MHz, with noise measurement application,
            phase noise measurement, low noise path, wideband IF output, with asset ID AC-0424, 
            is currently available.
            
            3. The lowest cost oscilloscope we have available today is the Keysight N90308, 50 GHz, 
            40 MHz, Low noise path, with asset ID AC-0020, priced at $79,453.`;

  const reply = await gpt4(userPrompt, systemPrompt);
  return reply;
};

async function getMainProduct(userPrompt) {
  const systemPrompt = `Pretend that you're a product search assistant for a sales professional in an
            electronics test and measurement wholesaler company that sells products of manufacturers
            like Keysight, Tektonix, Rohde & Schwarz, Digilent, etc.
            Pretend you have access to a large list of their electronic test and measurement products 
            like signal generators, oscilloscopes, digital multimeters, spectrum analyzers, 
            and similar products.
            Pretend you also know each product's specifications and current inventory levels.
            Just make up realistic sounding inventory data, dates, current information about
            availability.
            For any query, identify just the main product in the query and ignore any other
            requirements.`;
    
  const prompt = 
   `Identify the main electronics product type in this query and return just one product type
    without any other brand, text, prefix, suffix, or explanations:
    
    ${userPrompt}`;

  const product = await gpt4(prompt, systemPrompt);
  return product;
};

async function generateImage(product) {
    // https://platform.openai.com/docs/api-reference/images/create
    const response = await openaic.images.generate({
      model: "dall-e-3",
      prompt: product,
      style : 'natural',
      n: 1,
      size: "1024x1024",
    });
    console.log(response);
    const image_url = response.data[0].url;
    return image_url;
};

async function gpt4(userPrompt, systemPrompt='') {
  
  const completion = await openaic.chat.completions.create({
    messages: [
      { role: "system", content: systemPrompt},
      { role: "user", content: userPrompt }
    ],
    model: "gpt-4-1106-preview",
  });

  let reply = completion.choices[0].message.content;
  return reply;
    
};

// Listen on port
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});

