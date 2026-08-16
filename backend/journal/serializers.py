from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework.validators import UniqueTogetherValidator
from .models import Entry


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']
        read_only_fields = ['id']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'},
        min_length=6
    )
    email = serializers.EmailField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password']
        extra_kwargs = {
            'username': {'required': True},
        }

    def validate_username(self, value):
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("A user with that username already exists.")
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True, style={'input_type': 'password'})

    def validate(self, data):
        username = data.get('username')
        password = data.get('password')

        if not username or not password:
            raise serializers.ValidationError("Must include both username and password.")

        user = authenticate(username=username, password=password)
        if not user:
            raise serializers.ValidationError("Invalid credentials. Please check your username and password.")

        if not user.is_active:
            raise serializers.ValidationError("User account is disabled.")

        data['user'] = user
        return data


class EntrySerializer(serializers.ModelSerializer):
    owner_username = serializers.ReadOnlyField(source='owner.username')

    class Meta:
        model = Entry
        fields = [
            'id',
            'owner',
            'owner_username',
            'content',
            'date',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'owner', 'owner_username', 'created_at', 'updated_at']

    def validate_content(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Content cannot be empty.")
        return value.strip()

    def validate(self, attrs):
        request = self.context.get('request')
        if request and request.user:
            user = request.user
            date = attrs.get('date')

            # If creating a new entry (self.instance is None)
            if self.instance is None and date:
                if Entry.objects.filter(owner=user, date=date).exists():
                    raise serializers.ValidationError({
                        'date': f"An entry already exists for {date}. You can edit the existing entry."
                    })
            # If updating date of an existing entry
            elif self.instance is not None and date and date != self.instance.date:
                if Entry.objects.filter(owner=user, date=date).exclude(pk=self.instance.pk).exists():
                    raise serializers.ValidationError({
                        'date': f"An entry already exists for {date}."
                    })

        return attrs
