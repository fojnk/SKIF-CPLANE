-- Стартовый набор моделей оптической цепочки / синхротрона для маркетплейса кубов (t_cubes).
-- Идемпотентно: повторный прогон не меняет существующие записи с тем же name.

INSERT INTO t_cubes (name, author, description, base_id, params_name, params, type)
VALUES
(
    'SkifSynchrotronMonochromator',
    'system',
    'Монохроматор — выбор энергии/длины волны пучка (стартовая модель СКИФ)',
    NULL,
    'SkifSynchrotronMonochromatorParams',
    $c${
        "inputs": {"type": "static", "list_names": ["beam_in"]},
        "outputs": {"type": "static", "list_names": ["beam_out"]},
        "args": [
            {
                "name": "energy_keV",
                "type": {"type": "double"},
                "required": false,
                "default": 12.0,
                "description": "Целевая энергия фотонов, кэВ"
            },
            {
                "name": "bandwidth_relative",
                "type": {"type": "double"},
                "required": false,
                "default": 0.001,
                "description": "Относительная ширина полосы пропускания"
            }
        ]
    }$c$::jsonb,
    'CIT_CUBE'
),
(
    'SkifSynchrotronSlit',
    'system',
    'Щель — ограничение размера и угловой расходимости пучка',
    NULL,
    'SkifSynchrotronSlitParams',
    $c${
        "inputs": {"type": "static", "list_names": ["beam_in"]},
        "outputs": {"type": "static", "list_names": ["beam_out"]},
        "args": [
            {
                "name": "gap_mm",
                "type": {"type": "double"},
                "required": false,
                "default": 0.1,
                "description": "Ширина щели, мм"
            },
            {
                "name": "offset_mm",
                "type": {"type": "double"},
                "required": false,
                "default": 0.0,
                "description": "Смещение щели от оси, мм"
            }
        ]
    }$c$::jsonb,
    'CIT_CUBE'
),
(
    'SkifSynchrotronMirror',
    'system',
    'Плоское зеркало — отражение пучка под заданным углом',
    NULL,
    'SkifSynchrotronMirrorParams',
    $c${
        "inputs": {"type": "static", "list_names": ["beam_in"]},
        "outputs": {"type": "static", "list_names": ["beam_out"]},
        "args": [
            {
                "name": "grazing_angle_mrad",
                "type": {"type": "double"},
                "required": false,
                "default": 3.0,
                "description": "Скользящий угол, мрад"
            }
        ]
    }$c$::jsonb,
    'CIT_CUBE'
),
(
    'SkifSynchrotronFocusingMirror',
    'system',
    'Фокусирующее зеркало (например KB) — конденсирование пучка в фокусе',
    NULL,
    'SkifSynchrotronFocusingMirrorParams',
    $c${
        "inputs": {"type": "static", "list_names": ["beam_in"]},
        "outputs": {"type": "static", "list_names": ["beam_out"]},
        "args": [
            {
                "name": "focal_distance_m",
                "type": {"type": "double"},
                "required": false,
                "default": 1.0,
                "description": "Фокусное расстояние, м"
            },
            {
                "name": "demagnification",
                "type": {"type": "double"},
                "required": false,
                "default": 1.0,
                "description": "Демагнификация (отношение размеров)"
            }
        ]
    }$c$::jsonb,
    'CIT_CUBE'
),
(
    'SkifSynchrotronCollimator',
    'system',
    'Коллиматор — формирование параллельного пучка',
    NULL,
    'SkifSynchrotronCollimatorParams',
    $c${
        "inputs": {"type": "static", "list_names": ["beam_in"]},
        "outputs": {"type": "static", "list_names": ["beam_out"]},
        "args": [
            {
                "name": "aperture_mm",
                "type": {"type": "double"},
                "required": false,
                "default": 1.0,
                "description": "Апертура коллиматора, мм"
            }
        ]
    }$c$::jsonb,
    'CIT_CUBE'
),
(
    'SkifSynchrotronAttenuator',
    'system',
    'Аттенюатор — ослабление интенсивности пучка',
    NULL,
    'SkifSynchrotronAttenuatorParams',
    $c${
        "inputs": {"type": "static", "list_names": ["beam_in"]},
        "outputs": {"type": "static", "list_names": ["beam_out"]},
        "args": [
            {
                "name": "transmission",
                "type": {"type": "double"},
                "required": false,
                "default": 0.5,
                "description": "Коэффициент пропускания (0..1)"
            }
        ]
    }$c$::jsonb,
    'CIT_CUBE'
),
(
    'SkifSynchrotronShutter',
    'system',
    'Заслонка — вкл/выкл прохождение пучка',
    NULL,
    'SkifSynchrotronShutterParams',
    $c${
        "inputs": {"type": "static", "list_names": ["beam_in"]},
        "outputs": {"type": "static", "list_names": ["beam_out"]},
        "args": [
            {
                "name": "open",
                "type": {"type": "boolean"},
                "required": false,
                "default": true,
                "description": "Открыта ли заслонка"
            }
        ]
    }$c$::jsonb,
    'CIT_CUBE'
),
(
    'SkifSynchrotronFilter',
    'system',
    'Фильтр — подавление гармоник / выделение диапазона',
    NULL,
    'SkifSynchrotronFilterParams',
    $c${
        "inputs": {"type": "static", "list_names": ["beam_in"]},
        "outputs": {"type": "static", "list_names": ["beam_out"]},
        "args": [
            {
                "name": "material",
                "type": {"type": "string"},
                "required": false,
                "default": "Al",
                "description": "Материал фильтра"
            },
            {
                "name": "thickness_mm",
                "type": {"type": "double"},
                "required": false,
                "default": 0.5,
                "description": "Толщина, мм"
            }
        ]
    }$c$::jsonb,
    'CIT_CUBE'
),
(
    'SkifSynchrotronSampleStage',
    'system',
    'Позиционер образца — смещение и ориентация объекта в пучке',
    NULL,
    'SkifSynchrotronSampleStageParams',
    $c${
        "inputs": {"type": "static", "list_names": ["beam_in"]},
        "outputs": {"type": "static", "list_names": ["beam_out"]},
        "args": [
            {
                "name": "x_mm",
                "type": {"type": "double"},
                "required": false,
                "default": 0.0,
                "description": "Позиция X, мм"
            },
            {
                "name": "y_mm",
                "type": {"type": "double"},
                "required": false,
                "default": 0.0,
                "description": "Позиция Y, мм"
            },
            {
                "name": "omega_deg",
                "type": {"type": "double"},
                "required": false,
                "default": 0.0,
                "description": "Угол ω вокруг вертикальной оси, град"
            }
        ]
    }$c$::jsonb,
    'CIT_CUBE'
),
(
    'SkifSynchrotronDetector',
    'system',
    'Детектор — регистрация рассеянного/прошедшего сигнала',
    NULL,
    'SkifSynchrotronDetectorParams',
    $c${
        "inputs": {"type": "static", "list_names": ["beam_in"]},
        "outputs": {"type": "static", "list_names": ["signal_out"]},
        "args": [
            {
                "name": "exposure_s",
                "type": {"type": "double"},
                "required": false,
                "default": 1.0,
                "description": "Время экспозиции, с"
            },
            {
                "name": "pixel_size_um",
                "type": {"type": "double"},
                "required": false,
                "default": 75.0,
                "description": "Размер пикселя, мкм"
            }
        ]
    }$c$::jsonb,
    'CIT_CUBE'
),
(
    'SkifSynchrotronDrift',
    'system',
    'Свободный пролёт — перенос пучка на расстояние без оптики',
    NULL,
    'SkifSynchrotronDriftParams',
    $c${
        "inputs": {"type": "static", "list_names": ["beam_in"]},
        "outputs": {"type": "static", "list_names": ["beam_out"]},
        "args": [
            {
                "name": "length_m",
                "type": {"type": "double"},
                "required": false,
                "default": 1.0,
                "description": "Длина пролёта, м"
            }
        ]
    }$c$::jsonb,
    'CIT_CUBE'
)
ON CONFLICT (name) DO NOTHING;
