const fs = require("fs");
const stringSimilarity = require("string-similarity");

//Função para normalizar o nome do produto
function normalizeProductName(name) {
    return name.toLowerCase() //Converte o nome para minúsculas
        .replace(/[^a-z0-9]+/g, " ") //Remove caracteres especiais e substitui por espaços
        .replace(/\b(1l|2l|5kg|1kg|quilos?|litro)\b/g, "") //Remove unidades de medida como "1l", "2l", etc.
        .trim(); //Remove espaços em branco no início e no final
}

//Função para categorizar os produtos
function categorizeProducts(products) {
    let categories = []; //Array para armazenar as categorias

    products.forEach(product => {
        let normalized = normalizeProductName(product.title); //Normaliza o nome do produto
        let foundCategory = null; //Variável para armazenar a categoria encontrada

        for (let category of categories) {
            if (isSimilar(category.normalized, normalized)) {
                foundCategory = category; //Armazena se achar uma categoria semelhante
                break; //Sai do loop
            }
        }

        //Se encontrou uma categoria semelhante
        if (foundCategory) {
            foundCategory.count++; //Adciona o contador de produtos na categoria
            foundCategory.products.push({ title: product.title, supermarket: product.supermarket }); //Adiciona o produto a categoria
        } else {
            //Se não encontrou, cria uma nova categoria
            categories.push({
                category: product.title, //Nome da categoria usando o título do produto
                normalized, //Nome normalizado para comparação
                count: 1, //Contador de produtos
                products: [{ title: product.title, supermarket: product.supermarket }] //Lista de produtos
            });
        }
    });

    //Retorna as categorias, removendo a propriedade 'normalized' que foi usada apenas para comparação
    return categories.map(({ normalized, ...rest }) => rest);
}

//Função para verificar se dois nomes de produtos são semelhantes
function isSimilar(name1, name2) {
    const importantKeywords = ["zero", "zero lactose", "integral", "desnatado", "semi desnatado", "tipo 1", "tipo 2", "tipo 3"]; //Palavras-chave importantes
    for (let keyword of importantKeywords) {
        const hasKeyword1 = name1.includes(keyword); //Verifica se a primeira string contém a palavra-chave
        const hasKeyword2 = name2.includes(keyword); //Verifica se a segunda string contém a palavra-chave
        if (hasKeyword1 !== hasKeyword2) return false; //Se uma tem e a outra não, considera que são diferentes
    }
    return stringSimilarity.compareTwoStrings(name1, name2) > 0.85; //Compara a similaridade das strings
}

//Função principal que executa o programa
function main() {
    const data = JSON.parse(fs.readFileSync("data01.json")); //Lê o arquivo 'data01.json' e converte para objeto JavaScript
    const categorizedProducts = categorizeProducts(data); //Categoriza os produtos
    console.log(JSON.stringify(categorizedProducts, null, 2)); //Exibe o resultado no console, formatado com indentação de 2 espaços
}

main();