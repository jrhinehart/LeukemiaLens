
async function test() {
    const ids = '41245143,41378055,41376850';
    const email = 'jr.rhinehart@gmail.com';
    const tool = 'LeukemiaLens';
    const url = `https://pmc.ncbi.nlm.nih.gov/tools/idconv/api/v1/articles/?ids=${ids}&format=json&email=${email}&tool=${tool}`;

    console.log(`Fetching: ${url}`);
    const response = await fetch(url);
    const text = await response.text();
    console.log('Response:');
    console.log(text);
}

test();
