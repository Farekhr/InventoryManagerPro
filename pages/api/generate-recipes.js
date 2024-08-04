import axios from 'axios';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { inventory } = req.body;
    const apiKey = process.env.OPENROUTER_API_KEY;

    try {
      const ingredients = inventory.join(', ');
      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: 'openai/gpt-3.5-turbo',
          messages: [
            {
              role: 'user',
              content: `Create a recipe using the following ingredients: ${ingredients}`,
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const recipes = response.data.choices.map((choice) => ({
        title: 'Generated Recipe',
        ingredients: choice.message.content.split('\n').filter((line) => line),
      }));

      res.status(200).json({ recipes });
    } catch (error) {
      console.error('Error:', error.response ? error.response.data : error.message);
      res.status(500).json({ error: 'Error generating recipes' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
