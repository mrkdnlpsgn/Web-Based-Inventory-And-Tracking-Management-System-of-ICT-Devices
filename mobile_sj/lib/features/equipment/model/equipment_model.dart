class DeviceModel {
  final int id;
  final int equipmentId;
  final String? itemCode;
  final String? serialNumber;
  final String? model;
  final double? amountValue;
  final String? acquisitionDate;
  final String createdAt;

  const DeviceModel({
    required this.id,
    required this.equipmentId,
    this.itemCode,
    this.serialNumber,
    this.model,
    this.amountValue,
    this.acquisitionDate,
    required this.createdAt,
  });

  factory DeviceModel.fromJson(Map<String, dynamic> json) => DeviceModel(
        id: json['id'] as int,
        equipmentId: json['equipmentId'] as int,
        itemCode: json['itemCode'] as String?,
        serialNumber: json['serialNumber'] as String?,
        model: json['model'] as String?,
        amountValue: json['amountValue'] != null ? (json['amountValue'] as num).toDouble() : null,
        acquisitionDate: json['acquisitionDate'] as String?,
        createdAt: json['createdAt'] as String,
      );
}

class EquipmentModel {
  final int id;
  final String type;
  final String equipmentType;
  final String itemCode;
  final String article;
  final String office;
  final String location;
  final String? description;
  final String accountablePerson;
  final String? accountablePersonPhone;
  final String? accountablePersonEmail;
  final int deviceCount;
  final List<DeviceModel> devices;
  final String createdAt;
  final String updatedAt;

  const EquipmentModel({
    required this.id,
    required this.type,
    required this.equipmentType,
    required this.itemCode,
    required this.article,
    required this.office,
    required this.location,
    this.description,
    required this.accountablePerson,
    this.accountablePersonPhone,
    this.accountablePersonEmail,
    required this.deviceCount,
    required this.devices,
    required this.createdAt,
    required this.updatedAt,
  });

  factory EquipmentModel.fromJson(Map<String, dynamic> json) => EquipmentModel(
        id: json['id'] as int,
        type: json['type'] as String,
        equipmentType: json['equipmentType'] as String,
        itemCode: json['itemCode'] as String,
        article: json['article'] as String,
        office: json['office'] as String,
        location: json['location'] as String,
        description: json['description'] as String?,
        accountablePerson: json['accountablePerson'] as String,
        accountablePersonPhone: json['accountablePersonPhone'] as String?,
        accountablePersonEmail: json['accountablePersonEmail'] as String?,
        deviceCount: json['deviceCount'] as int,
        devices: json['devices'] != null
            ? (json['devices'] as List).map((e) => DeviceModel.fromJson(e as Map<String, dynamic>)).toList()
            : [],
        createdAt: json['createdAt'] as String,
        updatedAt: json['updatedAt'] as String,
      );
}
