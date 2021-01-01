var fs = require('fs');

var seconds = new Date().getTime() / 1000;
function createDbFile() {
  let initialized = fs.readdirSync('./').includes('mydb.txt')
  if (!initialized) {
    fs.appendFile('mydb.txt', '{}', function (err) {
      if (err) throw err;
      console.log('DB File Created');
    });
  } else {
    console.log('File already exists');
  }
}
createDbFile()
// function readFromFile() {
//   return JSON.parse(fs.readFileSync(`${__dirname}/./mydb.txt`), {encoding: 'utf-8'});
// }
 const products =  JSON.parse(fs.readFileSync('./mydb.txt'), {encoding: 'utf-8'});

 exports.checkID = (req, res, next, val) => {
    console.log(`Product id is: ${val}`); 
    const id = req.params.id * 1;

    console.log(req.method)
    var exists= products.find(el => el.id=== id);
    if (id > products.length || typeof(exists) === "undefined") {
      return res.status(404).json({
        status: 'fail',
        message: 'Invalid ID'
      });
    }
    if(exists.time_to_live && exists.time_to_live<seconds)
    {
        return res.status(404).json({
            status: 'fail',
            message: 'Id has expired'
          });
    }
    next();
  };
  
  exports.checkBody = (req, res, next) => {
    if (!req.body.name || !req.body.price ||!req.body.rating || !req.body.id) {
      return res.status(400).json({
        status: 'fail',
        message: 'Missing id or name or price or rating'
      });
    }
    const id = req.body.id * 1;
    var exists= products.find(el => el.id=== id);
    if(exists &&req.method!="PATCH"){
        return res.status(404).json({
            status: 'fail',
            message: 'Id already exists'
          });
    }
    next();
  };

  exports.checkSize = (req, res, next) => {
    var stats = fs.statSync('./mydb.txt');
    var fileSizeInBytes = stats.size +req.socket.bytesRead;
    // Convert the file size to megabytes (optional)
    var fileSizeInGigabytes = (fileSizeInBytes / (1024*1024*1024));
    if(fileSizeInGigabytes>1)
    {
        return res.status(400).json({
            status: 'fail',
            message: 'File size is exceeded (max is 1GB)'
          });
    }
    next();
  };

function writeToFile(newObject) {
  fs.writeFileSync('./mydb.txt', JSON.stringify(newObject), (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log('Data written to file', newObject);
    }
  });
}
exports.getAllProducts = (req, res) => {
    try {
    res.status(200).json({
      status: 'success',
      requestedAt: req.requestTime,
      results: products.length,
      data: {
        products
      }
    });
}
catch (err) {
    res.status(500).json({
        status: 'error',
        message: 'Unable to fetch all products'
      });
}
  };

  exports.getProduct = (req, res) => {
    try {
    console.log(req.params);
    const id = req.params.id * 1;
    const product = products.find(el => el.id === id);
    console.log(products);
    console.log(id);
    res.status(200).json({
      status: 'success',
      data: {
        product
      }
    });
}
catch (err) {
    res.status(500).json({
        status: 'error',
        message: 'Unable to fetch product'
      });
}
  };
  
  exports.createProduct = (req, res) => {
    try {
    var newProduct= Object.assign(req.body);
    if(newProduct.time_to_live)
    {
        req.body.time_to_live=(seconds+req.body.time_to_live)
        newProduct= Object.assign( req.body);
    }
    products.push(newProduct);
    writeToFile(products);
    res.status(201).json({
        status: 'success',
        data: {
          product: newProduct
        }
      });
    }
    catch (err) {
        res.status(500).json({
            status: 'error',
            message: 'Unable to create product'
          });
    }
  };

  
exports.updateProduct = (req, res) => {
    try {
    const id = req.params.id * 1;
    const updatedProduct = Object.assign({ id: id }, req.body);
    // products[id]=updatedProduct
    products.pop(products[id]);
    products.push(updatedProduct);
    console.log(req.body)
    console.log(products[id])
    console.log(updatedProduct)
    console.log(products)
    writeToFile(products);
    res.status(200).json({
      status: 'success',
      data: {
        status: 'success',
        data:products.find(el => el.id === id)
      }
    });
}
catch (err) {
    res.status(500).json({
        status: 'error',
        message: 'Unable to update product'
      });
}
  };
  
  exports.deleteProduct = (req, res) => {
    try {
    const id = req.params.id * 1;
    const deleteProduct = Object.assign({ id: id }, req.body);
    products.pop(deleteProduct);
    console.log(products)
    writeToFile(products);
    res.status(204).json({
      status: 'success',
      data: null
    });
}
catch (err) {
    res.status(500).json({
        status: 'error',
        message: 'Unable to delete product'
      });
}
  };