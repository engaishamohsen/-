export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // التعامل مع طلبات الـ API الخاصة بالمساعد الذكي
    if (url.pathname === '/api/chat' && request.method === 'POST') {
      try {
        const body = await request.json();
        const userMessage = body.message || '';

        // التحقق من توفر خدمة الذكاء الاصطناعي في بيئة Cloudflare Workers AI
        if (!env.AI) {
          return new Response(JSON.stringify({ error: 'AI binding is not configured in Cloudflare settings.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          });
        }

        // استدعاء نموذج الذكاء الاصطناعي (Llama أو نموذج متاح على Cloudflare Workers AI)
        const aiResponse = await env.AI.run('@cf/meta/llama-3-8b-instruct', {
          messages: [
            {
              role: 'system',
              content: أنت "مساعد طالب الهندسة"، مساعد ذكي خاص بطلبة كلية الهندسة بجامعة مصراتة (بوابة طالب الهندسة https://unigov.misuratau.edu.ly/su/). 
              مهمتك مساعدة الطلاب في العثور على الشيتات، الملخصات، أسئلة الامتحانات السابقة (مثل رياضة 3، فيزياء 2، أساسيات التكييف، وغيرها)، وتوليد اختبارات قصيرة أو تلخيص المفاهيم الهندسية. كن ودوداً، دقيقاً، وساعدهم باللغة العربية.
            },
            {
              role: 'user',
              content: userMessage
            }
          ],
        });

        return new Response(JSON.stringify({ reply: aiResponse.response || 'عذراً، لم أتمكن من معالجة الرد حالياً.' }), {
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });

      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    // السماح بطلب الـ OPTIONS للـ CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    // إذا لم يكن طلب API، يتم جلب الملفات الثابتة للموقع بشكل طبيعي (Static Assets)
    return env.ASSETS.fetch(request);
  },
};
