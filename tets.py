# 需要安装: pip install google-generativeai
import google.generativeai as genai

# (推荐 127.0.0.1)
genai.configure(
    api_key="sk-93531d5e0ec141c9b3f869d980276067",
    transport='rest',
    client_options={'api_endpoint': 'http://127.0.0.1:8045'}
)

model = genai.GenerativeModel('gemini-2.5-flash')
response = model.generate_content("Hello")
print(response.text)