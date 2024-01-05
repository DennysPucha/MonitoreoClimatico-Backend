'use strict';

const models = require('../models');
const {sensor, rol, cuenta, sequelize,persona } = models;
const uuid = require('uuid');

class SensorControl {

    async obtener(req, res) {
        const external = req.params.external;

        try {
            const lista = await sensor.findOne({
                where: { external_id: external },
                attributes: ['nombre', 'ip', 'tipo_sensor', 'estado', 'external_id']
            });

            if (!lista) {
                res.status(404);
                return res.json({ message: "Recurso no encontrado", code: 404, data: {} });
            }

            res.status(200);
            res.json({ message: "Éxito", code: 200, data: lista });
        } catch (error) {
            res.status(500);
            res.json({ message: "Error interno del servidor", code: 500, error: error.message });
        }
    }

    async obtenerReportes(req, res) {
        const external = req.params.external;

        try {
            const lista = await sensor.findOne({
                where: { external_id: external },
                include:[{model:models.reporte, as:"reporte",attributes:['fecha','dato','external_id']}],
                attributes: ['nombre', 'ip', 'tipo_sensor', 'estado', 'external_id']
            });

            if (!lista) {
                res.status(404);
                return res.json({ message: "Recurso no encontrado", code: 404, data: {} });
            }

            res.status(200);
            res.json({ message: "Éxito", code: 200, data: lista });
        } catch (error) {
            res.status(500);
            res.json({ message: "Error interno del servidor", code: 500, error: error.message });
        }
    }

    async listar(req, res) {
        try {
            const lista = await sensor.findAll({
                attributes: ['nombre', 'ip', 'tipo_sensor', 'estado', 'external_id'],
                include:[{model:models.reporte, as:"reporte",attributes:['fecha','dato','external_id']}],
            });

            res.status(200);
            res.json({ message: "Éxito", code: 200, data: lista });
        } catch (error) {
            res.status(500);
            res.json({ message: "Error interno del servidor", code: 500, error: error.message });
        }
    }

    async guardar(req, res) {
        const { nombre, ip, tipo_sensor, persona:id_persona} = req.body;

        if (nombre && ip && tipo_sensor && id_persona) {
            try {
                const perA = await models.persona.findOne({ where: { external_id: id_persona } });

                if (!perA) {
                    res.status(400);
                    return res.json({ message: "Error de solicitud", tag: "Persona no existente", code: 400 });
                }



                const data = {
                    nombre,
                    ip,
                    tipo_sensor,
                    external_id: uuid.v4(),
                    id_persona: perA.id,
                };

                const transaction = await sequelize.transaction();

                try {
                    const result = await sensor.create(data);
                    
                    await transaction.commit();

                    if (!result) {
                        res.status(401);
                        return res.json({ message: "Error de autenticación", tag: "No se puede crear", code: 401 });
                    }

                    res.status(200);
                    res.json({ message: "Éxito", code: 200 });
                } catch (error) {
                    await transaction.rollback();
                    res.status(203);
                    res.json({ message: "Error de procesamiento", code: 203, error: error.message });
                }
            } catch (error) {
                res.status(500);
                res.json({ message: "Error interno del servidor", code: 500, error: error.message });
            }
        } else {
            res.status(400);
            res.json({ message: "Error de solicitud", tag: "Datos incorrectos", code: 400 });
        }
    }

    async modificar(req, res) {
        if (
            req.body.hasOwnProperty('nombre') &&
            req.body.hasOwnProperty('ip') &&
            req.body.hasOwnProperty('tipo_sensor') &&
            req.body.hasOwnProperty('persona')
        ) {
            const external = req.params.external;
    
            try {
                const sensorA = await models.sensor.findOne({where: {external_id:external} })
            
                const perA = await models.persona.findOne({ where: { external_id: req.body.persona} });
            
                if (!perA) {
                    res.status(400);
                    return res.json({ msg: "ERROR", tag: "Rol no existente", code: 400 });
                }
                if (!sensorA) {
                    res.status(400);
                    return res.json({ msg: "ERROR", tag: "Sensor no existente", code: 400 });
                }
            
                const data = {
                    nombre: req.body.nombre,
                    ip: req.body.ip,
                    tipo_sensor: req.body.tipo_sensor,
                    id_persona: perA.id,
                };
            
                const transaction = await models.sequelize.transaction();
            
                try {

            
                    await sensorA.update(data);
            
                    await transaction.commit();
            
                    res.status(200);
                    res.json({ msg: "OK", code: 200 });
            
                } catch (error) {
                    if (transaction) await transaction.rollback();
            
                    res.status(203);
                    res.json({ msg: "ERROR", code: 203, error_msg: error.message });
                }
            
            } catch (error) {
                res.status(500);
                res.json({ msg: "ERROR", code: 500, error_msg: error.message });
            }
        } else {
            res.status(400);
            res.json({ msg: "ERROR", tag: "Datos incorrectos", code: 400 });
        }
    }


}

module.exports = SensorControl;