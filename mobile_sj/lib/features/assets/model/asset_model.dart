class CategoryModel {
  final int id;
  final String categoryName;

  const CategoryModel({required this.id, required this.categoryName});

  factory CategoryModel.fromJson(Map<String, dynamic> json) => CategoryModel(
        id: json['id'] as int,
        categoryName: json['categoryName'] as String,
      );
}

class OfficeModel {
  final int id;
  final String officeName;

  const OfficeModel({required this.id, required this.officeName});

  factory OfficeModel.fromJson(Map<String, dynamic> json) => OfficeModel(
        id: json['id'] as int,
        officeName: json['officeName'] as String,
      );
}

class AssetModel {
  final int id;
  final String propertyNumber;
  final String description;
  final CategoryModel category;
  final int quantity;
  final String acquisitionDate;
  final double unitValue;
  final OfficeModel office;
  final String? accountablePerson;
  final int? physicalCount;
  final String location;
  final String condition;       // SERVICEABLE | REPAIRABLE | UNSERVICEABLE
  final String lifecycleStatus; // REGISTERED | ASSIGNED | TRANSFERRED | UNDER_MAINTENANCE | DISPOSED | ARCHIVED
  final String? remarks;
  final String createdAt;
  final String updatedAt;

  const AssetModel({
    required this.id,
    required this.propertyNumber,
    required this.description,
    required this.category,
    required this.quantity,
    required this.acquisitionDate,
    required this.unitValue,
    required this.office,
    this.accountablePerson,
    this.physicalCount,
    required this.location,
    required this.condition,
    required this.lifecycleStatus,
    this.remarks,
    required this.createdAt,
    required this.updatedAt,
  });

  factory AssetModel.fromJson(Map<String, dynamic> json) => AssetModel(
        id: json['id'] as int,
        propertyNumber: json['propertyNumber'] as String,
        description: json['description'] as String,
        category: CategoryModel.fromJson(json['category'] as Map<String, dynamic>),
        quantity: json['quantity'] as int,
        acquisitionDate: json['acquisitionDate'] as String,
        unitValue: (json['unitValue'] as num).toDouble(),
        office: OfficeModel.fromJson(json['office'] as Map<String, dynamic>),
        accountablePerson: json['accountablePerson'] as String?,
        physicalCount: json['physicalCount'] as int?,
        location: json['location'] as String,
        condition: json['condition'] as String,
        lifecycleStatus: json['lifecycleStatus'] as String,
        remarks: json['remarks'] as String?,
        createdAt: json['createdAt'] as String,
        updatedAt: json['updatedAt'] as String,
      );
}
