export const generateMockProducts = (count = 12, categories = [], sortOption = '') => {
  const products = []
  const categoryList =
    categories.length > 0
      ? categories
      : [
          'Electronics',
          'Clothing',
          'Books',
          'Sports',
          'Furniture',
          'Appliances',
          'Entertainment',
          'Miscellaneous',
          'Tickets',
        ]

  for (let i = 0; i < count; i++) {
    const category =
      categories.length > 0
        ? categories[Math.floor(Math.random() * categories.length)]
        : categoryList[i % categoryList.length]

    const product = {
      pid: `pid-${i}-${Math.random().toString(36).substr(2, 9)}`,
      userUID: `user-uid-${i}`,
      name: `${category}-product ${i}`,
      price: 10.99 + i * 5,
      description: `This is a sample description for product ${i}`,
      category: category,
      quantity: 50 + i,
      popularityScore: 10 - (i % 10) + Math.random(),
      postedAt: new Date(Date.now() - i * 86400000).toISOString(), // Each product posted 1 day apart
      postedBy: 'GatorUser',
      imageSrc: `https://cdn.dummyjson.com/products/images/${category.toLowerCase()}/product${i + 1}.png`,
    }

    products.push(product)
  }

  if (sortOption) {
    switch (sortOption) {
      case 'price_asc':
        products.sort((a, b) => a.price - b.price)
        break
      case 'price_desc':
        products.sort((a, b) => b.price - a.price)
        break
      case 'name_asc':
        products.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'name_desc':
        products.sort((a, b) => b.name.localeCompare(a.name))
        break
      case 'newest':
        products.sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime())
        break
      case 'most_popular':
      default:
        products.sort((a, b) => b.popularityScore - a.popularityScore)
        break
    }
  }

  return products
}
