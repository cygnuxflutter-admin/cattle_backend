function transformArrayOfBulls(inputArray) {
    const resultArray = [];

    inputArray.forEach(item => {
        resultArray.push({
            id: item.tag_id.toString(),
            value: item.calf_name
        });
    });

    resultArray.push({
        id: "NA",
        value: "NA"
    });

    return resultArray;
}

function transformArrayOfVendors(inputArray) {
    const resultArray = [];

    inputArray.forEach(item => {
        resultArray.push({
            Code: item.Code.toString(),
            Group: item.Group.toString(),
            Name: item.Name.toString(),
            Mobile_No: item.Mobile_No
        });
    });

    resultArray.push({
        Code: "NA",
        Group: "NA",
        Name: "NA",
        Mobile_No: 0
    });

    return resultArray;
}

//get value from master json
function transformArrayOfMasterItems(inputArray) {
    const resultArray = [];

    inputArray.forEach(item => {
        resultArray.push({
            UnitType: item.UnitType.toString(),
            OutUnitType: item.OutUnitType,
            ExpenceType: item.ExpenceType.toString(),
            ItemId: item.ItemId.toString(),
            ItemName: item.ItemName.toString(),
            isStock: item.isStock,
            autoInfo: item.autoInfo
        });
    });

    // resultArray.push({
    //     UnitType: "NA",
    //     OutUnitType: "NA",
    //     ExpenceType: "NA",
    //     ItemId: "NA",
    //     ItemName: "NA",
    //     isStock: false
    // });

    return resultArray;
}

function transformArrayOfSalesItems(inputArray) {
    const resultArray = [];
    inputArray.forEach(item => {
        resultArray.push({
            "id": item.item_id,
            "item_name": item.item_name,
            "unit": item.unit,
            "piece_qty": item.piece_qty,
            "rate_per_unit": item.rate_per_unit
        })
    })
    return resultArray;
}

function transformArrayOfDepartment(inputArray) {
    const resultArray = [];
    inputArray.forEach(item => {
        resultArray.push({
            "id": item.department_id,
            "value": item.value,
            "mobile_no": item.mobile_no,
            "email_id": item.email_id
        })
    })
    return resultArray;
}

function transformArrayOfExpenseType(inputArray) {
    const resultArray = [];
    inputArray.forEach(item => {
        resultArray.push({
            "id": item.value,
            "value": item.value
        })
    })
    return resultArray;
}

function transformArrayOfvehicles(inputArray) {
    const resultArray = [];
    inputArray.forEach(item => {
        resultArray.push({
            "vehicle_name": item.value,
            "vehicle_number": item.default_id
        })
    })
    return resultArray;
}

function transformArrayOfGaushala_list(inputArray) {
    const resultArray = [];
    inputArray.forEach(item => {
        resultArray.push({
            "id": item.default_id,
            "value": item.value
        })
    })
    return resultArray;
}

function transformArrayOfProducts(inputArray) {
    const aaray_products = [];

    inputArray.forEach(item => {
        aaray_products.push({
            id: item.item_name.toString(),
            value: `${item.item_name.toString()}`
        });
    });
    return aaray_products;
}

module.exports = {
    transformArrayOfBulls,
    transformArrayOfProducts,
    transformArrayOfVendors,
    transformArrayOfMasterItems,
    transformArrayOfSalesItems,
    transformArrayOfDepartment,
    transformArrayOfExpenseType,
    transformArrayOfvehicles,
    transformArrayOfGaushala_list
}