#pragma once

#include <memory>
#include <utility>

#include <jsi/jsi.h>

#include "JsiSkHostObjects.h"
#include "third_party/CSSColorParser.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include <SkPoint.h>

#pragma clang diagnostic pop

namespace RNSkia {

    using namespace facebook;

    class JsiSkColor : public JsiHostObject {
    public:

        JsiSkColor(): JsiHostObject() {}

        ~JsiSkColor() {}

        /**
         * Creates the function for construction a new instance of the SkPoint
         * wrapper
         * @return A function for creating a new host object wrapper for the SkPoint
         * class
         */
        static const jsi::HostFunctionType
        createCtor() {
            return JSI_HOST_FUNCTION_LAMBDA {
                auto text = arguments[0].asString(runtime).utf8(runtime);
                auto color = CSSColorParser::parse(text);
                if (color.a == -1.0f) {
                    return jsi::Value::undefined();
                }
                int a = round(color.a * 255);
                return jsi::Value(static_cast<double>(SkColorSetARGB(a, color.r, color.g, color.b)));
            };
        }
    };
} // namespace RNSkia
